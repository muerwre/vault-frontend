import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FILE_TYPES,
  type FileType,
  type UploadTarget,
} from '@vault/common/constants';
import type { FileMetadata } from '@vault/common/types';
import sharp from 'sharp';
import { Repository } from 'typeorm';

import { getUploadsConfig } from '../../config/env';
import { File } from '../../entities/file.entity';
import type { User } from '../../entities/user.entity';
import { toWireShallowFile, type WireShallowFile } from '../../wire/serialize';

import {
  generateUploadName,
  isMimeAllowedForType,
  needsScaling,
  remoteFileName,
} from './upload.paths';

@Injectable()
export class UploadService {
  private readonly logger = new Logger('Upload');

  constructor(
    @InjectRepository(File) private readonly files: Repository<File>,
  ) {}

  get maxSizeBytes(): number {
    return getUploadsConfig().maxSizeMb * 1024 * 1024;
  }

  /**
   * Writes the file to disk and records it.
   *
   * `target` is validated but **not stored**: a fresh upload has no target until
   * a node or comment claims it. That is what lets orphaned uploads be
   * identified later.
   */
  async store(
    contents: Buffer,
    originalName: string,
    mime: string,
    fileType: FileType,
    _target: UploadTarget,
    user: User,
  ): Promise<WireShallowFile> {
    const { path: root } = getUploadsConfig();
    const generated = generateUploadName(originalName, fileType);
    const directory = join(root, generated.path);

    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, generated.name), contents);

    const metadata = await this.extractMetadata(
      contents,
      mime,
      fileType,
      originalName,
    );

    const saved = await this.files.save(
      this.files.create({
        name: generated.name,
        origName: originalName,
        path: generated.path,
        fullPath: generated.fullPath,
        url: generated.url,
        size: contents.length,
        type: fileType,
        mime,
        metadata,
        userId: user.id,
      }),
    );

    await this.maybeWriteWebp(
      contents,
      mime,
      fileType,
      directory,
      generated.name,
    );

    return toWireShallowFile(saved) as WireShallowFile;
  }

  /**
   * Fetches a remote file and stores it as if it had been uploaded — used to
   * adopt an OAuth provider's avatar.
   *
   * Returns null when the fetch fails or the response is not the expected kind
   * of file, so a caller can treat it as optional.
   */
  async storeRemote(
    url: string,
    target: UploadTarget,
    fileType: FileType,
    user: User,
  ): Promise<WireShallowFile | null> {
    const response = await fetch(url);

    if (!response.ok) {
      this.logger.warn(`remote fetch failed for ${url}: ${response.status}`);
      return null;
    }

    const mime = (response.headers.get('content-type') ?? '').split(';')[0];

    if (!isMimeAllowedForType(fileType, mime)) {
      this.logger.warn(
        `remote file ${url} is ${mime || 'untyped'}, not ${fileType}`,
      );
      return null;
    }

    const contents = Buffer.from(await response.arrayBuffer());

    if (contents.length > this.maxSizeBytes) {
      this.logger.warn(`remote file ${url} is too big`);
      return null;
    }

    return this.store(
      contents,
      remoteFileName(url, mime),
      mime,
      fileType,
      target,
      user,
    );
  }

  /**
   * Image dimensions and dominant colour, or audio duration and ID3 tags.
   * Extraction failures degrade to empty metadata rather than failing the upload.
   */
  private async extractMetadata(
    contents: Buffer,
    mime: string,
    fileType: FileType,
    originalName: string,
  ): Promise<FileMetadata> {
    try {
      if (fileType === FILE_TYPES.IMAGE) {
        return needsScaling(mime)
          ? await this.imageMetadata(contents)
          : // SVG has no raster dimensions to read.
            {};
      }

      return await this.audioMetadata(contents, originalName);
    } catch (error) {
      this.logger.warn(
        `could not read metadata for ${originalName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {};
    }
  }

  private async imageMetadata(contents: Buffer): Promise<FileMetadata> {
    const image = sharp(contents, { failOn: 'none' });
    const { width, height } = await image.metadata();

    return {
      width: width ?? 0,
      height: height ?? 0,
      dominant_color: await this.dominantColor(contents),
    };
  }

  /** Averages the image down to a single pixel and renders it as `#rrggbb`. */
  private async dominantColor(contents: Buffer): Promise<string> {
    try {
      const { data } = await sharp(contents, { failOn: 'none' })
        .resize(1, 1, { fit: 'cover' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const hex = [data[0], data[1], data[2]]
        .map((channel) => channel.toString(16).padStart(2, '0'))
        .join('');

      return `#${hex.toUpperCase()}`;
    } catch {
      return '';
    }
  }

  private async audioMetadata(
    contents: Buffer,
    originalName: string,
  ): Promise<FileMetadata> {
    // music-metadata ships ESM only, so it cannot be required at module load.
    const { parseBuffer } = await import('music-metadata');
    const parsed = await parseBuffer(contents);

    const id3title = parsed.common.title ?? '';
    const id3artist = parsed.common.artist ?? '';

    return {
      // Rounded because the stored field is an integer.
      duration: Math.round(parsed.format.duration ?? 0),
      id3title,
      id3artist,
      // Falls back to the filename so the player always has something to show.
      title: id3title || originalName,
    };
  }

  /**
   * Optional companion WebP alongside the original. Best-effort: a failure is
   * logged and ignored, since the original is already stored.
   */
  private async maybeWriteWebp(
    contents: Buffer,
    mime: string,
    fileType: FileType,
    directory: string,
    name: string,
  ): Promise<void> {
    if (
      !getUploadsConfig().outputWebp ||
      fileType !== FILE_TYPES.IMAGE ||
      !needsScaling(mime)
    ) {
      return;
    }

    try {
      const webp = await sharp(contents, { failOn: 'none' }).webp().toBuffer();

      await mkdir(dirname(join(directory, name)), { recursive: true });
      await writeFile(join(directory, `${name}.webp`), webp);
    } catch (error) {
      this.logger.warn(
        `could not write webp for ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
