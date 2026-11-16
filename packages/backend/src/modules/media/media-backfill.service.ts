import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NODE_TYPES } from '@vault/common/constants';
import {
  MEDIA_OWNER_TYPES,
  MEDIA_PRIORITIES,
  MEDIA_PROVIDER_DEFS,
} from '@vault/common/media';
import { Brackets, Repository } from 'typeorm';

import { getMediaCacheConfig } from '../../config/env';
import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';

import { MediaRefsService } from './media-refs.service';
import { refsFromBlocks, refsFromText } from './media.rules';

const CHUNK = 200;

/** Breathing room between chunks, so a scan never crowds out requests. */
const PAUSE_MS = 50;

const pause = () =>
  new Promise<void>((resolve) => setTimeout(resolve, PAUSE_MS).unref());

/**
 * Records the links of everything posted so far, oldest first, so items posted
 * before the cache existed (or while it was off) get planned too. Runs once per
 * start; re-recording a link is harmless.
 */
@Injectable()
export class MediaBackfillService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('MediaBackfill');

  private current?: Promise<void>;

  private stopping = false;

  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    private readonly refs: MediaRefsService,
  ) {}

  onApplicationBootstrap(): void {
    if (getMediaCacheConfig().enabled) {
      this.current = this.run();
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.stopping = true;
    await this.current;
  }

  /** The whole scan. Exposed so it can be driven directly. */
  async run(): Promise<void> {
    try {
      const nodes = await this.scanNodes();
      const comments = await this.scanComments();

      this.logger.log(`recorded links of ${nodes} nodes, ${comments} comments`);
    } catch (error) {
      this.logger.error(
        `backfill failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async scanNodes(): Promise<number> {
    let after = 0;
    let seen = 0;

    while (!this.stopping) {
      const rows = await this.nodes
        .createQueryBuilder('node')
        .select(['node.id', 'node.blocks'])
        .where('node.type = :type', { type: NODE_TYPES.VIDEO })
        .andWhere('node.deleted_at IS NULL')
        .andWhere('node.id > :after', { after })
        .orderBy('node.id', 'ASC')
        .take(CHUNK)
        .getMany();

      for (const node of rows) {
        await this.refs.syncOwner(
          MEDIA_OWNER_TYPES.NODE,
          node.id,
          refsFromBlocks(node.blocks),
          MEDIA_PRIORITIES.BACKFILL,
        );
      }

      seen += rows.length;

      if (rows.length < CHUNK) {
        return seen;
      }

      after = rows[rows.length - 1].id;
      await pause();
    }

    return seen;
  }

  private async scanComments(): Promise<number> {
    const hints = Object.values(MEDIA_PROVIDER_DEFS).flatMap(
      (def) => def.textHints,
    );
    let after = 0;
    let seen = 0;

    while (!this.stopping) {
      const rows = await this.comments
        .createQueryBuilder('comment')
        .select(['comment.id', 'comment.text'])
        // A live comment under a deleted node is not shown either.
        .innerJoin('comment.node', 'node', 'node.deleted_at IS NULL')
        .where('comment.deleted_at IS NULL')
        .andWhere('comment.id > :after', { after })
        .andWhere(
          new Brackets((query) => {
            hints.forEach((hint, index) =>
              query.orWhere(`comment.text LIKE :hint${index}`, {
                [`hint${index}`]: `%${hint}%`,
              }),
            );
          }),
        )
        .orderBy('comment.id', 'ASC')
        .take(CHUNK)
        .getMany();

      for (const comment of rows) {
        await this.refs.syncOwner(
          MEDIA_OWNER_TYPES.COMMENT,
          comment.id,
          refsFromText(comment.text),
          MEDIA_PRIORITIES.BACKFILL,
        );
      }

      seen += rows.length;

      if (rows.length < CHUNK) {
        return seen;
      }

      after = rows[rows.length - 1].id;
      await pause();
    }

    return seen;
  }
}
