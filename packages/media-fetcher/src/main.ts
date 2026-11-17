import { copyFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { BackendClient } from './backend/api';
import { loadConfig } from './config/config';
import { runDownloadJob } from './jobs/download-job';
import { Worker } from './jobs/worker';
import { IntervalLimiter } from './shared/limiter';
import { describeError, log } from './shared/log';
import { createTools } from './tools/media-tools';
import { YtDlpUpdater } from './tools/updater';

const main = async () => {
  const config = loadConfig();
  const api = new BackendClient(config.backendUrl, config.key);
  const tools = createTools(config);
  const updater = new YtDlpUpdater(tools, config.updateEveryHours);
  const limiter = new IntervalLimiter(config.youtubeMinIntervalMs);
  const shutdown = new AbortController();

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => {
      log.info(`${signal}: finishing up`);
      shutdown.abort();
    });
  }

  await mkdir(config.workDir, { recursive: true });

  // yt-dlp writes refreshed cookies back to its file, so it gets a copy: the
  // original may be mounted read-only, and stays as it was exported.
  if (config.youtubeCookies) {
    const copy = join(config.workDir, 'youtube-cookies.txt');
    await copyFile(config.youtubeCookies, copy);
    config.youtubeCookies = copy;
  }
  await updater.start();

  log.info(
    `backend ${config.backendUrl}, youtube ${
      config.youtubeProxyUrl ? 'through a proxy' : 'direct'
    }, ladder ${config.qualityLadder.join('/')}p`,
  );

  const heavy = new Worker(
    'heavy',
    config.kinds,
    (job, signal) => runDownloadJob(job, { api, tools, config, signal }),
    {
      api,
      limiter,
      updater,
      idlePollMs: config.idlePollMs,
      rateLimitPauseMs: config.rateLimitPauseMs,
    },
  );

  await heavy.run(shutdown.signal);
};

main().catch((error: unknown) => {
  log.error(`fatal: ${describeError(error)}`);
  process.exit(1);
});
