import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  MEDIA_JOB_STATUSES,
  MEDIA_VIDEO_STATUSES,
  type MediaOwnerType,
  type MediaRef,
} from '@vault/common/media';
import type { DataSource, EntityManager } from 'typeorm';

import { getMediaCacheConfig } from '../../config/env';

import { diffIds } from './media.rules';

/**
 * Keeps `external_media_ref` in step with what a node or comment links, and
 * makes sure every linked item has an `external_media` row for the planner.
 */
@Injectable()
export class MediaRefsService {
  private readonly logger = new Logger('MediaRefs');

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Makes `owner` reference exactly `refs`. A no-op while the cache is off.
   *
   * Never throws: link tracking must not fail the write that triggered it, and
   * the backfill corrects anything missed.
   */
  async syncOwner(
    ownerType: MediaOwnerType,
    ownerId: number,
    refs: MediaRef[],
    priority: number,
  ): Promise<void> {
    if (!getMediaCacheConfig().enabled) {
      return;
    }

    try {
      await this.dataSource.transaction((manager) =>
        this.sync(manager, ownerType, ownerId, refs, priority),
      );
    } catch (error) {
      this.logger.error(
        `could not sync media links of ${ownerType} ${ownerId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  private async sync(
    manager: EntityManager,
    ownerType: MediaOwnerType,
    ownerId: number,
    refs: MediaRef[],
    priority: number,
  ): Promise<void> {
    const mediaIds = await this.ensureMedia(manager, refs, priority);

    const current = (
      (await manager.query(
        'SELECT media_id FROM external_media_ref WHERE owner_type = ? AND owner_id = ?',
        [ownerType, ownerId],
      )) as Array<{ media_id: number }>
    ).map((row) => Number(row.media_id));

    const { added, removed } = diffIds(current, mediaIds);

    if (removed.length > 0) {
      await manager.query(
        `DELETE FROM external_media_ref
          WHERE owner_type = ? AND owner_id = ? AND media_id IN (?)`,
        [ownerType, ownerId, removed],
      );
    }

    if (added.length > 0) {
      await manager.query(
        `INSERT IGNORE INTO external_media_ref (media_id, owner_type, owner_id)
         VALUES ${added.map(() => '(?, ?, ?)').join(', ')}`,
        added.flatMap((mediaId) => [mediaId, ownerType, ownerId]),
      );
    }
  }

  /**
   * Creates missing items and returns the ids of all of them. An item linked
   * again takes the more urgent priority, and one whose copy was removed is
   * planned again.
   */
  private async ensureMedia(
    manager: EntityManager,
    refs: MediaRef[],
    priority: number,
  ): Promise<number[]> {
    if (refs.length === 0) {
      return [];
    }

    await manager.query(
      `INSERT INTO external_media (provider, external_id, priority)
       VALUES ${refs.map(() => '(?, ?, ?)').join(', ')}
       ON DUPLICATE KEY UPDATE
         priority = LEAST(priority, VALUES(priority)),
         video_status = IF(video_status = ?, ?, video_status)`,
      [
        ...refs.flatMap((ref) => [ref.provider, ref.id, priority]),
        MEDIA_VIDEO_STATUSES.REMOVED,
        MEDIA_VIDEO_STATUSES.NONE,
      ],
    );

    const rows = (await manager.query(
      `SELECT id FROM external_media
        WHERE (provider, external_id) IN (${refs.map(() => '(?, ?)').join(', ')})`,
      refs.flatMap((ref) => [ref.provider, ref.id]),
    )) as Array<{ id: number }>;

    const ids = rows.map((row) => Number(row.id));

    // Work already waiting for these items moves up with them.
    await manager.query(
      `UPDATE media_job SET priority = LEAST(priority, ?)
        WHERE media_id IN (?) AND status = ?`,
      [priority, ids, MEDIA_JOB_STATUSES.QUEUED],
    );

    return ids;
  }
}
