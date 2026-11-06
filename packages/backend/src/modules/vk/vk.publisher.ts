import { stat } from 'fs/promises';
import { join } from 'path';

import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NOTIFICATION_ITEM_TYPES,
  OAUTH_PROVIDERS,
} from '@vault/common/constants';
import { Repository } from 'typeorm';

import {
  getUploadsConfig,
  getVkPublisherConfig,
  isVkPublisherUsable,
} from '../../config/env';
import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { isFlowType } from '../node/node.permissions';

import { VkApiService } from './vk.api';
import {
  buildPostMessage,
  thumbnailStoragePath,
  wallPostLink,
} from './vk.content';
import { VkQueueService } from './vk.queue';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;

/**
 * Posts queued nodes to the group wall.
 *
 * Runs on a plain interval rather than a scheduler: the only timing it needs is
 * "every N minutes", and the loop has to be startable and stoppable from specs.
 */
@Injectable()
export class VkPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('VK');

  private timer?: NodeJS.Timeout;

  constructor(
    private readonly queue: VkQueueService,
    private readonly api: VkApiService,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(NodeSocialPublication)
    private readonly publications: Repository<NodeSocialPublication>,
  ) {}

  async onModuleInit(): Promise<void> {
    const config = getVkPublisherConfig();

    if (!isVkPublisherUsable(config)) {
      this.logger.log(
        config.groupId > 0
          ? 'publishing off: NOTIFICATIONS_VK_GROUP_ID is set but NOTIFICATIONS_VK_API_KEY is not'
          : 'publishing off (no NOTIFICATIONS_VK_GROUP_ID); nodes are still queued',
      );
      return;
    }

    if (!(await this.api.checkToken())) {
      this.logger.error(
        `publishing disabled: get a fresh token from https://oauth.vk.com/authorize` +
          `?client_id=${config.appId}&display=page` +
          `&redirect_uri=https://oauth.vk.com/blank.html` +
          `&scope=groups,offline,wall,photos&response_type=token&v=5.131`,
      );

      return;
    }

    this.logger.log(
      `publishing to group ${config.groupId} every ${config.cooldownMins}m`,
    );

    this.timer = setInterval(() => {
      void this.runOnce();
    }, config.cooldownMins * MINUTE_MS);

    // Long-running and unattended: never hold the process open.
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /**
   * Publishes everything currently due. Exposed so the loop can be driven
   * directly rather than waited on.
   */
  async runOnce(): Promise<void> {
    const config = getVkPublisherConfig();
    const now = Date.now();

    const pending = await this.queue.pending(
      NOTIFICATION_ITEM_TYPES.NODE,
      new Date(now - config.cooldownMins * MINUTE_MS),
      new Date(now - config.purgeAfterDays * DAY_MS),
    );

    for (const item of pending) {
      try {
        await this.publish(item.itemId as number);
      } catch (error) {
        this.logger.warn(
          `could not publish node ${item.itemId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  /**
   * Posts one node, then records the permalink as its social backlink.
   *
   * A node that is gone, hidden or no longer listed in the flow is dropped from
   * the queue instead — it was queued when it still qualified.
   */
  private async publish(nodeId: number): Promise<void> {
    const node = await this.nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.user', 'user')
      .where('node.id = :nodeId AND node.deleted_at IS NULL', { nodeId })
      .getOne();

    if (!node || !node.isPublic || !isFlowType(node)) {
      await this.queue.dropUnsent(NOTIFICATION_ITEM_TYPES.NODE, nodeId);
      this.logger.log(
        `dropped node ${nodeId}: no longer a public flow node, not posting`,
      );
      return;
    }

    const config = getVkPublisherConfig();
    const attachment = await this.uploadThumbnail(node);

    const postId = await this.api.postToWall(
      buildPostMessage(node, config.urlPrefix),
      attachment ? [attachment] : [],
    );

    if (postId === null) {
      throw new Error('wall.post returned no post id');
    }

    const now = new Date();
    now.setMilliseconds(0);

    await this.queue.markSent(NOTIFICATION_ITEM_TYPES.NODE, nodeId, now);

    const link = wallPostLink(config.groupId, postId);

    await this.publications.insert({
      nodeId,
      provider: OAUTH_PROVIDERS.VKONTAKTE,
      link,
      createdAt: now,
      updatedAt: now,
    });

    this.logger.log(`posted node ${nodeId}: ${link}`);
  }

  /** Null when the node has no local thumbnail or the upload fails. */
  private async uploadThumbnail(node: Node): Promise<string | null> {
    if (!node.thumbnail) {
      this.logger.log(
        `node ${node.id} has no thumbnail; posting without image`,
      );
      return null;
    }

    const relative = thumbnailStoragePath(node.thumbnail);

    if (!relative) {
      this.logger.log(
        `node ${node.id} thumbnail is not a local upload (${node.thumbnail}); posting without image`,
      );
      return null;
    }

    const absolute = join(getUploadsConfig().path, relative);

    // Diagnostic only: the upload is still attempted and reports its own error.
    if (!(await fileExists(absolute))) {
      this.logger.warn(
        `node ${node.id} thumbnail missing on disk: ${absolute}`,
      );
    }

    return this.api.uploadPhoto(absolute);
  }
}

const fileExists = async (path: string): Promise<boolean> => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};
