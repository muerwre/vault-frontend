import type { Logger } from '@nestjs/common';
import type { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

import { getMediaCacheConfig, getScheduleTimeZone } from '../../config/env';

/**
 * Runs `onTick` on `cron` in the schedule time zone, while the media cache is
 * on. A bad expression or zone is logged and leaves the work unscheduled;
 * it never stops the backend from starting.
 */
export const scheduleMediaJob = (options: {
  scheduler: SchedulerRegistry;
  logger: Logger;
  name: string;
  cron: string;
  /** What runs, for the log: `re-scanning`, `cleaning up`… */
  description: string;
  onTick: () => void;
}): void => {
  const { scheduler, logger, name, cron, description, onTick } = options;
  const timeZone = getScheduleTimeZone();

  try {
    const job = CronJob.from({
      cronTime: cron,
      timeZone,
      onTick: () => {
        if (getMediaCacheConfig().enabled) {
          onTick();
        }
      },
    });

    scheduler.addCronJob(name, job);
    job.start();
    logger.log(`${description} on "${cron}" (${timeZone})`);
  } catch (error) {
    logger.error(
      `${name} not scheduled, "${cron}" in ${timeZone} is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

/** Stops a job {@link scheduleMediaJob} started, if it is running. */
export const unscheduleMediaJob = (
  scheduler: SchedulerRegistry,
  name: string,
): void => {
  if (scheduler.doesExist('cron', name)) {
    scheduler.deleteCronJob(name);
  }
};
