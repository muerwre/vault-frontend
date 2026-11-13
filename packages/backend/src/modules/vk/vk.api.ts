import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

import { Injectable, Logger } from '@nestjs/common';
import { VK } from 'vk-io';

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
      this.logger.log('no NOTIFICATIONS_VK_ALBUM_ID; posting without image');
      return null;
    }

    try {
      // A stream over a missing file fails with an 'error' event nobody is
      // listening to, which takes the whole process down. Checked first, a
      // missing file is just a failed upload.
      await stat(absolutePath);

      const client = this.vk();
      const [photo] = await client.upload.photoAlbum({
        album_id: albumId,
        group_id: groupId,
        source: { value: createReadStream(absolutePath) },
      });

      const attachment = photo?.toString() ?? null;

      this.logger.log(
        attachment
          ? `uploaded ${absolutePath} to album ${albumId} as ${attachment}`
          : `upload of ${absolutePath} to album ${albumId} returned no photo`,
      );

      return attachment;
    } catch (error) {
      // vk-io api errors carry VK's numeric code, which says more than the text.
      const code = (error as { code?: unknown })?.code;

      this.logger.warn(
        `could not upload ${absolutePath} to album ${albumId} of group ${groupId}` +
          `${code !== undefined ? ` (VK error ${String(code)})` : ''}: ${
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

    const client = this.vk();
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
      const client = this.vk();
      await client.api.groups.getById({ group_id: String(groupId) });

      return true;
    } catch (error) {
      this.logger.error(
        `token rejected: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }

  /** Rebuilt when the token changes, so config edits do not need a restart. */
  private vk(): VK {
    const { apiKey } = getVkPublisherConfig();

    if (!this.client || this.clientToken !== apiKey) {
      this.client = new VK({ token: apiKey });
      this.clientToken = apiKey;
    }

    return this.client;
  }
}
