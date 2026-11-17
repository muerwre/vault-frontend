import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { NODE_TYPES } from '@vault/common/constants';
import {
  MEDIA_OWNER_TYPES,
  MEDIA_PRIORITIES,
  MEDIA_PROVIDER_DEFS,
} from '@vault/common/media';
import { Brackets, Repository } from 'typeorm';

import { getMediaCacheConfig, getMediaRescanCron } from '../../config/env';
import { Comment } from '../../entities/comment.entity';
import { Node } from '../../entities/node.entity';

import { MediaPlannerService } from './media-planner.service';
import { MediaRefsService } from './media-refs.service';
import { scheduleMediaJob, unscheduleMediaJob } from './media-schedule';
import { MediaSourceService } from './media-source.service';
import { refsFromBlocks, refsFromText } from './media.rules';

const CHUNK = 200;

/** Breathing room between chunks, so a scan never crowds out requests. */
const PAUSE_MS = 50;

const pause = () =>
  new Promise<void>((resolve) => setTimeout(resolve, PAUSE_MS).unref());

const RESCAN_JOB = 'media-rescan';

/**
 * Records the links of everything posted so far, oldest first, so items posted
 * before the cache existed (or while it was off) get planned too, and links a
 * save failed to record are repaired. Runs on start and on a schedule;
 * re-recording a link is harmless.
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
    private readonly scheduler: SchedulerRegistry,
    private readonly sources: MediaSourceService,
    private readonly planner: MediaPlannerService,
  ) {}

  onApplicationBootstrap(): void {
    if (!getMediaCacheConfig().enabled) {
      return;
    }

    // A start releases one backlog batch, once the scan has filled the
    // backlog, besides those MEDIA_BACKLOG_CRON releases.
    void this.run().then(() =>
      this.stopping ? undefined : this.planner.releaseBacklog(),
    );
    this.schedule();
  }

  async onModuleDestroy(): Promise<void> {
    unscheduleMediaJob(this.scheduler, RESCAN_JOB);

    this.stopping = true;
    await this.current;
  }

  /**
   * The whole scan. A call while one is running shares it. Exposed so it can
   * be driven directly.
   */
  run(): Promise<void> {
    this.current ??= this.scan().finally(() => {
      this.current = undefined;
    });

    return this.current;
  }

  /** A bad expression is reported and leaves only the startup scan. */
  private schedule(): void {
    scheduleMediaJob({
      scheduler: this.scheduler,
      logger: this.logger,
      name: RESCAN_JOB,
      cron: getMediaRescanCron(),
      description: 're-scanning',
      onTick: () => {
        void this.run();
      },
    });
  }

  private async scan(): Promise<void> {
    try {
      const nodes = await this.scanNodes();
      const comments = await this.scanComments();

      this.logger.log(`recorded links of ${nodes} nodes, ${comments} comments`);

      // Originals of stored copies, so clients know which ones to fall back on.
      const changed = await this.sources.checkDue();

      if (changed > 0) {
        this.logger.log(`${changed} originals changed availability`);
      }
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
