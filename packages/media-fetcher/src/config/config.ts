import { MEDIA_JOB_KINDS, type MediaJobKind } from '@vault/common/media';

import { nonNegativeInt, parseLadder, positiveInt } from './utils';

export interface FetcherConfig {
  /** The backend's API root, e.g. `http://10.0.0.1:8000/api`. */
  backendUrl: string;
  /** This fetcher's secret from the backend's `MEDIA_FETCHER_KEYS`. */
  key: string;
  /** Route for YouTube traffic only; never for the backend. Empty is direct. */
  youtubeProxyUrl: string;
  /** cookies.txt for when YouTube asks to sign in. */
  youtubeCookies: string;
  /** Pause between YouTube jobs, across all workers. */
  youtubeMinIntervalMs: number;
  /** Heights to try, best first. */
  qualityLadder: number[];
  /** Scratch space; each job gets its own directory, removed afterwards. */
  workDir: string;
  /** Wait before asking again after the backend had nothing to do. */
  idlePollMs: number;
  /** Hours between yt-dlp self-updates. 0 turns them off. */
  updateEveryHours: number;
  /** Runtime yt-dlp solves YouTube's challenges with; empty leaves its default. */
  jsRuntime: string;
  /** Browser whose network fingerprint yt-dlp mimics; empty turns it off. */
  impersonate: string;
  /** Passed to yt-dlp's `--extractor-args`, e.g. `youtube:player_client=android`. */
  extractorArgs: string;
  /** How long to stay away from YouTube after it said to slow down. */
  rateLimitPauseMs: number;
  /** The kinds this fetcher has handlers for. */
  kinds: MediaJobKind[];
  ytDlpPath: string;
  ffprobePath: string;
}

/** Reads the environment; throws on what the fetcher cannot run without. */
export const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): FetcherConfig => {
  const backendUrl = (env.MEDIA_BACKEND_URL ?? '').trim().replace(/\/+$/, '');
  const key = (env.MEDIA_FETCHER_KEY ?? '').trim();

  if (!/^https?:\/\//.test(backendUrl)) {
    throw new Error('MEDIA_BACKEND_URL must be an http(s) url');
  }

  if (!key) {
    throw new Error('MEDIA_FETCHER_KEY is not set');
  }

  return {
    backendUrl,
    key,
    youtubeProxyUrl: (env.YOUTUBE_PROXY_URL ?? '').trim(),
    youtubeCookies: (env.YOUTUBE_COOKIES ?? '').trim(),
    youtubeMinIntervalMs:
      nonNegativeInt(env.YOUTUBE_MIN_INTERVAL_SEC, 60) * 1000,
    qualityLadder: parseLadder(env.QUALITY_LADDER),
    workDir: (env.WORK_DIR ?? '').trim() || '/tmp/media-fetcher',
    idlePollMs: positiveInt(env.IDLE_POLL_SEC, 30) * 1000,
    updateEveryHours: nonNegativeInt(env.YTDLP_UPDATE_HOURS, 24),
    jsRuntime: env.YTDLP_JS_RUNTIME ?? 'node',
    impersonate: (env.YTDLP_IMPERSONATE ?? 'chrome').trim(),
    extractorArgs: (env.YTDLP_EXTRACTOR_ARGS ?? '').trim(),
    rateLimitPauseMs:
      nonNegativeInt(env.YOUTUBE_RATE_LIMIT_PAUSE_MIN, 30) * 60 * 1000,
    kinds: [MEDIA_JOB_KINDS.DOWNLOAD],
    ytDlpPath: (env.YTDLP_PATH ?? '').trim() || 'yt-dlp',
    ffprobePath: (env.FFPROBE_PATH ?? '').trim() || 'ffprobe',
  };
};
