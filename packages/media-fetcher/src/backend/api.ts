import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';

import {
  MEDIA_SHA256_HEADER,
  type MediaClaimedJob,
  type MediaCompleteRequest,
  type MediaFailRequest,
  type MediaJobKind,
  type MediaJobStage,
  type MediaSkipRequest,
  type MediaUploadSlot,
} from '@vault/common/media';

/** A non-2xx answer from the backend. */
export class BackendError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`backend answered ${status} to ${path}`);
  }

  /** The job is no longer ours: finished, or its lease went to someone else. */
  get lostJob(): boolean {
    return this.status === 404 || this.status === 409;
  }
}

/** Requests to the backend give up after this; uploads are not limited. */
const REQUEST_TIMEOUT_MS = 30_000;

const sha256Of = async (path: string): Promise<string> => {
  const hash = createHash('sha256');

  for await (const chunk of createReadStream(path)) {
    hash.update(chunk as Buffer);
  }

  return hash.digest('hex');
};

/** The backend's `/internal/media` API, as one fetcher. */
export class BackendClient {
  constructor(
    private readonly baseUrl: string,
    private readonly key: string,
  ) {}

  /** The next job of `kinds`, or null when there is none. */
  async claim(
    kinds: MediaJobKind[],
    ytDlpVersion?: string,
  ): Promise<MediaClaimedJob | null> {
    const response = await this.send('POST', '/jobs/claim', {
      kinds,
      ytDlpVersion,
    });

    return response.status === 204
      ? null
      : ((await response.json()) as MediaClaimedJob);
  }

  async progress(
    jobId: number,
    percent: number,
    stage?: MediaJobStage,
  ): Promise<void> {
    await this.send('POST', `/jobs/${jobId}/progress`, { percent, stage });
  }

  /** Streams a file with its checksum; the body is never held in memory. */
  async upload(
    jobId: number,
    slot: MediaUploadSlot,
    path: string,
    mime: string,
  ): Promise<void> {
    const [hash, { size }] = await Promise.all([sha256Of(path), stat(path)]);

    await this.send('PUT', `/jobs/${jobId}/files/${slot}`, undefined, {
      body: Readable.toWeb(createReadStream(path)) as ReadableStream,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(size),
        [MEDIA_SHA256_HEADER]: hash,
      },
      timeout: false,
    });
  }

  async complete(jobId: number, request: MediaCompleteRequest): Promise<void> {
    await this.send('POST', `/jobs/${jobId}/complete`, request);
  }

  async fail(jobId: number, request: MediaFailRequest): Promise<void> {
    await this.send('POST', `/jobs/${jobId}/fail`, request);
  }

  async skip(jobId: number, request: MediaSkipRequest): Promise<void> {
    await this.send('POST', `/jobs/${jobId}/skip`, request);
  }

  private async send(
    method: string,
    path: string,
    json?: unknown,
    raw?: {
      body: ReadableStream;
      headers: Record<string, string>;
      timeout: false;
    },
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/internal/media${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.key}`,
        ...(raw ? raw.headers : { 'Content-Type': 'application/json' }),
      },
      body: raw ? raw.body : JSON.stringify(json ?? {}),
      signal: raw ? undefined : AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      // Required by fetch for a streamed request body.
      ...(raw ? { duplex: 'half' } : {}),
    } as RequestInit);

    if (!response.ok) {
      await response.body?.cancel().catch((): void => undefined);
      throw new BackendError(response.status, path);
    }

    return response;
  }
}
