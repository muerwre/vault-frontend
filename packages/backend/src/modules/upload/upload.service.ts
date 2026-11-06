import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join } from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FILE_TYPES,
  type FileType,
  type UploadTarget,
} from '@vault/common/constants';
import type { FileMetadata } from '@vault/common/types';
import { parseBuffer } from 'music-metadata';
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
  resolveUploadPath,
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

      return await this.audioMetadata(contents, originalName, mime);
    } catch (error) {
      this.logger.warn(
        `could not read metadata for ${originalName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return {};
    }
  }

  /**
   * Fills in image metadata that older uploads lack, reading the file from
   * disk, and saves it. An image needs it when it has no dimensions or no
   * dominant colour; clients size layouts and placeholders from both. Files
   * are updated in place. Best-effort: a missing or unreadable file is left
   * as it is.
   */
  async backfillImageMetadata(files: File[]): Promise<void> {
    const { path: root } = getUploadsConfig();

    for (const file of files) {
      const metadata = file.metadata ?? {};
      const incomplete =
        (!metadata.width && !metadata.height) || !metadata.dominant_color;

      if (
        file.type !== FILE_TYPES.IMAGE ||
        !incomplete ||
        !needsScaling(file.mime ?? '')
      ) {
        continue;
      }

      const absolute = resolveUploadPath(root, file.fullPath ?? '');

      if (!absolute) {
        continue;
      }

      try {
        const filled = {
          ...metadata,
          ...(await this.imageMetadata(await readFile(absolute))),
        };

        await this.files.update(file.id, { metadata: filled });
        file.metadata = filled;
      } catch {
        // Missing on disk or undecodable: leave the stored metadata alone.
      }
    }
  }

  private async imageMetadata(contents: Buffer): Promise<FileMetadata> {
    const image = sharp(contents, { failOn: 'none' });
    const { width, height, orientation } = await image.metadata();

    /**
     * Stored dimensions are the **displayed** ones. EXIF orientations 5-8 turn
     * the image on its side, so the stored width and height are swapped
     * relative to what a viewer sees — and clients size their layout from
     * these, which would leave every rotated photo in a wrongly-shaped box.
     */
    const turned = (orientation ?? 1) >= 5;

    return {
      width: (turned ? height : width) ?? 0,
      height: (turned ? width : height) ?? 0,
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
    mime: string,
  ): Promise<FileMetadata> {
    // The type and name pick the parser directly. Left to sniff the content,
    // the library gives up on files with anything before the first frame.
    const parsed = await parseBuffer(contents, {
      mimeType: mime,
      path: originalName,
    });

    const id3title = parsed.common.title ?? '';
    const id3artist = parsed.common.artist ?? '';

    return {
      // Rounded because the stored field is an integer.
      duration: Math.round(parsed.format.duration ?? 0),
      // Untagged files fall back to their name, so the player shows something.
      id3title: id3title || (id3artist ? '' : originalName),
      id3artist,
      // `title` is left unset: it is the name a user may type in the editor, and
      // clients show it in place of "<artist> - <title>" whenever it is set.
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
      // Re-encoding drops the EXIF orientation, so rotate before it is lost.
      const webp = await sharp(contents, { failOn: 'none', autoOrient: true })
        .webp()
        .toBuffer();

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
