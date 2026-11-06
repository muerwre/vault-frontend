import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import { dirname, extname } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { IMAGE_PRESETS, type ImagePreset } from '@vault/common/constants';

import { getUploadsConfig } from '../../config/env';

import { openRaster } from './raster';
import { cachePathFor, needsScaling, resolveUploadPath } from './upload.paths';

export interface ServableFile {
  absolutePath: string;
  /** True when the variant already existed, so it can be served with cache headers. */
  cached: boolean;
  /** Set when the bytes are not what the file's extension says. */
  contentType?: string;
}

/**
 * Browsers cannot show HEIC, so its variants are written as JPEG under the
 * source's own name — the cache path stays `cache/<preset>/<src>`.
 */
const JPEG_VARIANT_EXTENSIONS = new Set(['.heic', '.heif']);

const variantContentType = (src: string): string | undefined =>
  JPEG_VARIANT_EXTENSIONS.has(extname(src).toLowerCase())
    ? 'image/jpeg'
    : undefined;

/** Extensions mapped to the encoder sharp should use, keyed by source mime. */
const RASTER_MIMES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.svg': 'image/svg+xml',
};

@Injectable()
export class StaticService {
  private readonly logger = new Logger('Static');

  get root(): string {
    return getUploadsConfig().path;
  }

  isKnownPreset(preset: string): preset is keyof typeof IMAGE_PRESETS {
    return Object.prototype.hasOwnProperty.call(IMAGE_PRESETS, preset);
  }

  /** Resolves a plain static path, refusing anything outside the uploads root. */
  async resolvePlain(relative: string): Promise<string | null> {
    const absolute = resolveUploadPath(this.root, relative);

    return absolute && (await this.isFile(absolute)) ? absolute : null;
  }

  /**
   * Serves a scaled variant, generating and caching it on first request.
   *
   * The cache lives at `cache/<preset>/<src>` under the uploads root, so a
   * generated file is served directly on every later request.
   */
  async resolveScaled(
    preset: string,
    src: string,
  ): Promise<ServableFile | null> {
    if (!this.isKnownPreset(preset)) {
      return null;
    }

    const cacheRelative = cachePathFor(preset, src);
    const cacheAbsolute = resolveUploadPath(this.root, cacheRelative);
    const sourceAbsolute = resolveUploadPath(this.root, src);

    if (!cacheAbsolute || !sourceAbsolute) {
      return null;
    }

    const contentType = variantContentType(src);

    if (await this.isFile(cacheAbsolute)) {
      return { absolutePath: cacheAbsolute, cached: true, contentType };
    }

    if (!(await this.isFile(sourceAbsolute))) {
      return null;
    }

    try {
      await this.writeVariant(
        sourceAbsolute,
        cacheAbsolute,
        IMAGE_PRESETS[preset],
      );
    } catch (error) {
      this.logger.warn(
        `could not scale ${src} to ${preset}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      // Fall back to the original rather than failing the request.
      return { absolutePath: sourceAbsolute, cached: false };
    }

    return { absolutePath: cacheAbsolute, cached: false, contentType };
  }

  /**
   * Crop presets fill the box from the centre; width-only presets scale
   * proportionally. SVG is copied through untouched, since it scales itself.
   */
  private async writeVariant(
    source: string,
    destination: string,
    preset: (typeof IMAGE_PRESETS)[ImagePreset],
  ): Promise<void> {
    const contents = await readFile(source);
    const mime = this.guessMime(source);

    await mkdir(dirname(destination), { recursive: true });

    if (!needsScaling(mime)) {
      await writeFile(destination, contents);
      return;
    }

    const crop = 'crop' in preset && preset.crop === true;
    const height = 'height' in preset ? preset.height : undefined;

    /**
     * `autoOrient` is load-bearing: scaling drops the EXIF orientation tag, so
     * without physically rotating first, a camera photo comes out sideways in
     * every generated size while the untouched original still looks right.
     */
    const pipeline = (
      await openRaster(contents, { failOn: 'none', autoOrient: true })
    ).resize(
      preset.width,
      crop ? height : undefined,
      crop
        ? { fit: 'cover', position: 'centre' }
        : // Never enlarge a source smaller than the preset.
          { fit: 'inside', withoutEnlargement: true },
    );

    if (variantContentType(source)) {
      pipeline.jpeg();
    }

    await writeFile(destination, await pipeline.toBuffer());
  }

  private guessMime(path: string): string {
    const extension = path.slice(path.lastIndexOf('.')).toLowerCase();

    return RASTER_MIMES[extension] ?? 'application/octet-stream';
  }

  private async isFile(path: string): Promise<boolean> {
    try {
      return (await stat(path)).isFile();
    } catch {
      return false;
    }
  }
}
