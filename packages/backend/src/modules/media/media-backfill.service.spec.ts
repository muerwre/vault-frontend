import { SchedulerRegistry } from '@nestjs/schedule';
import type { Repository } from 'typeorm';

import type { Comment } from '../../entities/comment.entity';
import type { Node } from '../../entities/node.entity';

import { MediaBackfillService } from './media-backfill.service';
import type { MediaRefsService } from './media-refs.service';
import type { MediaSourceService } from './media-source.service';

/** Query builders over empty tables, so a scan finishes at once. */
const emptyRepo = () => {
  const builder: Record<string, unknown> = {};

  for (const method of [
    'select',
    'innerJoin',
    'where',
    'andWhere',
    'orderBy',
    'take',
  ]) {
    builder[method] = () => builder;
  }

  builder.getMany = jest.fn(async (): Promise<unknown[]> => []);

  return {
    builder,
    repo: { createQueryBuilder: () => builder },
  };
};

const setup = () => {
  const nodes = emptyRepo();
  const comments = emptyRepo();
  const scheduler = new SchedulerRegistry();
  const service = new MediaBackfillService(
    nodes.repo as unknown as Repository<Node>,
    comments.repo as unknown as Repository<Comment>,
    { syncOwner: jest.fn() } as unknown as MediaRefsService,
    scheduler,
    { checkDue: jest.fn(async () => 0) } as unknown as MediaSourceService,
  );

  return { service, scheduler, nodeQuery: nodes.builder.getMany as jest.Mock };
};

describe('MediaBackfillService', () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it('scans on start and schedules a rescan when enabled', async () => {
    process.env.CACHE_EXTERNAL_MEDIA = 'true';
    process.env.MEDIA_RESCAN_CRON = '0 30 3 * * *';

    const { service, scheduler, nodeQuery } = setup();
    service.onApplicationBootstrap();

    const job = scheduler.getCronJob('media-rescan');
    expect(job.isActive).toBe(true);
    expect(job.cronTime.source).toBe('0 30 3 * * *');

    await service.onModuleDestroy();

    expect(nodeQuery).toHaveBeenCalled();
    expect(scheduler.doesExist('cron', 'media-rescan')).toBe(false);
  });

  it('does nothing when disabled', async () => {
    process.env.CACHE_EXTERNAL_MEDIA = 'false';

    const { service, scheduler, nodeQuery } = setup();
    service.onApplicationBootstrap();

    expect(scheduler.getCronJobs().size).toBe(0);
    expect(nodeQuery).not.toHaveBeenCalled();

    await service.onModuleDestroy();
  });

  it('keeps the startup scan when the schedule is invalid', async () => {
    process.env.CACHE_EXTERNAL_MEDIA = 'true';
    process.env.MEDIA_RESCAN_CRON = 'every night please';

    const { service, scheduler, nodeQuery } = setup();
    service.onApplicationBootstrap();

    expect(scheduler.getCronJobs().size).toBe(0);

    await service.onModuleDestroy();

    expect(nodeQuery).toHaveBeenCalled();
  });

  it('shares a scan already in progress', async () => {
    const { service, nodeQuery } = setup();

    await Promise.all([service.run(), service.run()]);

    expect(nodeQuery).toHaveBeenCalledTimes(1);
  });
});
