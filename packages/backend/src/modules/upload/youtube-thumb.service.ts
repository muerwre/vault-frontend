import { stat } from 'fs/promises';

import { Injectable, Logger } from '@nestjs/common';

import { getUploadsConfig, isYoutubeThumbCacheEnabled } from '../../config/env';
import { youtubeFetch } from '../../globals/youtube-fetch';

import { writeAtomically } from './atomic-write';
import {
  isYoutubeId,
  resolveUploadPath,
  youtubeThumbPath,
} from './upload.paths';

/**
 * Covers to try, best first. `maxresdefault` is a 16:9 frame but exists only
 * for HD uploads; `hqdefault` exists for every video, letterboxed to 4:3.
 */
const SOURCES = ['maxresdefault', 'hqdefault'];

const sourceUrl = (id: string, name: string): string =>
  `https://i.ytimg.com/vi/${id}/${name}.jpg`;

/** Per attempt. Clients fall back to YouTube on failure, so fail fast. */
const FETCH_TIMEOUT_MS = 5_000;

/** Covers are a few hundred KB; anything far larger is not one. */
const MAX_COVER_BYTES = 5 * 1024 * 1024;

/** How long an id YouTube has no cover for is left alone. */
const NOT_FOUND_TTL_MS = 10 * 60 * 1000;

/** How long an id is left alone after a network or disk error. */
const ERROR_TTL_MS = 60 * 1000;

/** Downloads run at most this many at once; the rest wait their turn. */
const MAX_CONCURRENT_DOWNLOADS = 4;

/** Back-off entries kept before expired ones are swept, then all dropped. */
const MAX_BACKOFF_ENTRIES = 10_000;

type Outcome = 'stored' | 'not-found' | 'error';

/**
 * Keeps local copies of YouTube video covers, so clients never load them from
 * YouTube itself. A cover is downloaded once, on first request, and served from
 * disk from then on.
 */
@Injectable()
export class YoutubeThumbService {
  private readonly logger = new Logger('YoutubeThumb');

  /** Downloads in progress, so concurrent requests for one id share a fetch. */
  private readonly pending = new Map<string, Promise<boolean>>();

  /** Ids whose download failed, with when they may be tried again. */
  private readonly backoff = new Map<string, number>();

  private running = 0;

  private readonly queue: Array<() => void> = [];

  /** Absolute path of the stored cover; null for an invalid id or no root. */
  pathFor(id: string): string | null {
    if (!isYoutubeId(id)) {
      return null;
    }

    return resolveUploadPath(getUploadsConfig().path, youtubeThumbPath(id));
  }

  /**
   * Makes sure the cover for `id` is on disk, downloading it if it is not.
   * Resolves false when it is unavailable or the cache is off; never throws.
   */
  async ensure(id: string): Promise<boolean> {
    if (!isYoutubeThumbCacheEnabled()) {
      return false;
    }

    const absolute = this.pathFor(id);

    if (!absolute) {
      return false;
    }

    if (await isFile(absolute)) {
      return true;
    }

    const retryAt = this.backoff.get(id);

    if (retryAt !== undefined) {
      if (Date.now() < retryAt) {
        return false;
      }

      this.backoff.delete(id);
    }

    const inFlight = this.pending.get(id);

    if (inFlight) {
      return inFlight;
    }

    const download = this.withSlot(() => this.download(id, absolute)).finally(
      () => this.pending.delete(id),
    );

    this.pending.set(id, download);

    return download;
  }

  private async download(id: string, absolute: string): Promise<boolean> {
    let outcome: Outcome = 'not-found';

    for (const name of SOURCES) {
      try {
        const contents = await this.fetchImage(sourceUrl(id, name));

        if (contents) {
          await writeAtomically(absolute, contents);
          return true;
        }
      } catch (error) {
        // A timeout on one size must not skip the next one.
        outcome = 'error';
        this.logger.warn(
          `could not fetch ${name} for youtube video ${id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    if (outcome === 'not-found') {
      this.logger.warn(`no cover found for youtube video ${id}`);
    }

    this.backOff(id, outcome === 'not-found' ? NOT_FOUND_TTL_MS : ERROR_TTL_MS);

    return false;
  }

  /**
   * The image body, or null when YouTube has none at that URL. A missing cover
   * answers 404 with a placeholder image, so the status is what tells them apart.
   */
  private async fetchImage(url: string): Promise<Buffer | null> {
    const response = await youtubeFetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    const isImage = (response.headers.get('content-type') ?? '').startsWith(
      'image/',
    );
    const declared = Number(response.headers.get('content-length') ?? 0);

    if (!response.ok || !isImage || declared > MAX_COVER_BYTES) {
      // Release the connection rather than leaving it to the collector.
      await response.body?.cancel().catch((): void => undefined);
      return null;
    }

    const contents = Buffer.from(await response.arrayBuffer());

    return contents.length > MAX_COVER_BYTES ? null : contents;
  }

  private backOff(id: string, ttl: number): void {
    if (this.backoff.size >= MAX_BACKOFF_ENTRIES) {
      const now = Date.now();

      for (const [key, until] of this.backoff) {
        if (until <= now) {
          this.backoff.delete(key);
        }
      }

      if (this.backoff.size >= MAX_BACKOFF_ENTRIES) {
        this.backoff.clear();
      }
    }

    this.backoff.set(id, Date.now() + ttl);
  }

  /** Runs `task` once fewer than the maximum downloads are in flight. */
  private async withSlot<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= MAX_CONCURRENT_DOWNLOADS) {
      // The finishing task hands its slot straight over, so none is counted twice.
      await new Promise<void>((resolve) => this.queue.push(resolve));
    } else {
      this.running += 1;
    }

    try {
      return await task();
    } finally {
      const next = this.queue.shift();

      if (next) {
        next();
      } else {
        this.running -= 1;
      }
    }
  }
}

const isFile = async (path: string): Promise<boolean> => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};
