import { createReadStream } from 'fs';

import { Injectable, Logger } from '@nestjs/common';
import type { VK } from 'vk-io';

import { getVkPublisherConfig } from '../../config/env';

/**
 * The only place that talks to VK.
 *
 * Kept behind a narrow surface — upload a photo, make a post, check the token —
 * so the publisher's logic can be exercised without a live group.
 */
@Injectable()
export class VkApiService {
  private readonly logger = new Logger('VK');

  private client?: VK;

  private clientToken = '';

  /**
   * Uploads a photo to the configured album and returns its attachment string
   * (`photo<owner>_<id>`), or null when there is no album or the upload fails.
   *
   * A missing photo is not worth losing the post over, so failures degrade to
   * a text-only post.
   */
  async uploadPhoto(absolutePath: string): Promise<string | null> {
    const { groupId, albumId } = getVkPublisherConfig();

    if (!albumId) {
      return null;
    }

    try {
      const client = await this.vk();
      const [photo] = await client.upload.photoAlbum({
        album_id: albumId,
        group_id: groupId,
        source: { value: createReadStream(absolutePath) },
      });

      return photo?.toString() ?? null;
    } catch (error) {
      this.logger.warn(
        `could not upload ${absolutePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  /** Posts to the group wall as the group. Returns the new post's id. */
  async postToWall(
    message: string,
    attachments: string[],
  ): Promise<number | null> {
    const { groupId } = getVkPublisherConfig();

    const client = await this.vk();
    const result = await client.api.wall.post({
      // A group wall is addressed by its negated id.
      owner_id: -Math.abs(groupId),
      from_group: 1,
      message,
      ...(attachments.length > 0 ? { attachments: attachments.join(',') } : {}),
    });

    return result?.post_id ?? null;
  }

  /**
   * Confirms the token still works, so an expired one is reported at startup
   * rather than as a failed post hours later.
   */
  async checkToken(): Promise<boolean> {
    const { groupId } = getVkPublisherConfig();

    try {
      const client = await this.vk();
      await client.api.groups.getById({ group_id: String(groupId) });

      return true;
    } catch (error) {
      this.logger.error(
        `token rejected: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }

  /**
   * Rebuilt when the token changes, so config edits do not need a restart.
   *
   * The client is imported on first use rather than at module load: it pulls in
   * an ESM-only http library, which cannot be required from a CommonJS context.
   */
  private async vk(): Promise<VK> {
    const { apiKey } = getVkPublisherConfig();

    if (!this.client || this.clientToken !== apiKey) {
      const { VK: VkClient } = await import('vk-io');

      this.client = new VkClient({ token: apiKey });
      this.clientToken = apiKey;
    }

    return this.client;
  }
}
