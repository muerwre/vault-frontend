import type { FetcherConfig } from '../config/config';
import type { YtInfo } from '../youtube/formats';
import { PROGRESS_TEMPLATE } from '../youtube/progress';

import { run, type RunResult } from './run';

/** What the fetcher needs from the outside programs; faked in specs. */
export interface MediaTools {
  ytDlpVersion(): Promise<string>;
  updateYtDlp(): Promise<RunResult>;
  probe(
    url: string,
    signal?: AbortSignal,
  ): Promise<{ info: YtInfo | null; result: RunResult }>;
  download(options: {
    url: string;
    spec: string;
    dir: string;
    maxBytes: number;
    onLine: (line: string) => void;
    signal?: AbortSignal;
  }): Promise<RunResult>;
  /** Rewrites an mp4 with its index first, so playback can start at once. */
  faststart(from: string, to: string, signal?: AbortSignal): Promise<RunResult>;
  describe(path: string): Promise<VideoDescription | null>;
}

export interface VideoDescription {
  duration?: number;
  width?: number;
  height?: number;
  videoCodec?: string;
  audioCodec?: string;
}

/** Output file names inside a job's directory. */
export const DOWNLOADED = 'video.mp4';
export const THUMBNAIL = 'thumb.jpg';

export const createTools = (
  config: FetcherConfig,
  ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg',
): MediaTools => {
  /** Applies to every yt-dlp run that talks to YouTube. */
  /**
   * Every run that talks to YouTube: paced and browser-like, since YouTube
   * answers 429 to clients that fetch too fast or look automated.
   */
  const youtubeArgs = (): string[] => [
    '--no-playlist',
    '--sleep-requests',
    '1',
    '--retry-sleep',
    'http:exp=1:30',
    ...(config.impersonate ? ['--impersonate', config.impersonate] : []),
    ...(config.extractorArgs ? ['--extractor-args', config.extractorArgs] : []),
    ...(config.youtubeProxyUrl ? ['--proxy', config.youtubeProxyUrl] : []),
    ...(config.youtubeCookies ? ['--cookies', config.youtubeCookies] : []),
    ...(config.jsRuntime ? ['--js-runtimes', config.jsRuntime] : []),
  ];

  return {
    async ytDlpVersion() {
      const result = await run(config.ytDlpPath, ['--version'], {
        keepStdout: true,
      });
      return result.stdout.trim() || 'unknown';
    },

    updateYtDlp() {
      return run(config.ytDlpPath, [
        '--update-to',
        'stable',
        ...(config.youtubeProxyUrl ? ['--proxy', config.youtubeProxyUrl] : []),
      ]);
    },

    async probe(url, signal) {
      const result = await run(
        config.ytDlpPath,
        [...youtubeArgs(), '--dump-single-json', '--skip-download', url],
        { signal, keepStdout: true },
      );

      try {
        return {
          info:
            result.code === 0 ? (JSON.parse(result.stdout) as YtInfo) : null,
          result,
        };
      } catch {
        return { info: null, result };
      }
    },

    download({ url, spec, dir, maxBytes, onLine, signal }) {
      return run(
        config.ytDlpPath,
        [
          ...youtubeArgs(),
          '--format',
          spec,
          '--merge-output-format',
          'mp4',
          '--max-filesize',
          String(maxBytes),
          // a pause before each stream, as for a playlist
          '--sleep-interval',
          '2',
          '--max-sleep-interval',
          '5',
          '--write-thumbnail',
          '--convert-thumbnails',
          'jpg',
          '--newline',
          '--progress-template',
          PROGRESS_TEMPLATE,
          '--output',
          `${dir}/video.%(ext)s`,
          '--output',
          `thumbnail:${dir}/thumb.%(ext)s`,
          url,
        ],
        { onLine, signal },
      );
    },

    faststart(from, to, signal) {
      return run(
        ffmpegPath,
        [
          '-y',
          '-v',
          'error',
          '-i',
          from,
          '-c',
          'copy',
          '-movflags',
          '+faststart',
          to,
        ],
        { signal },
      );
    },

    async describe(path) {
      const result = await run(
        config.ffprobePath,
        [
          '-v',
          'error',
          '-show_entries',
          'format=duration:stream=codec_type,codec_name,width,height',
          '-of',
          'json',
          path,
        ],
        { keepStdout: true },
      );

      if (result.code !== 0) {
        return null;
      }

      try {
        return parseFfprobe(result.stdout);
      } catch {
        return null;
      }
    },
  };
};

interface FfprobeOutput {
  format?: { duration?: string };
  streams?: Array<{
    codec_type?: string;
    codec_name?: string;
    width?: number;
    height?: number;
  }>;
}

export const parseFfprobe = (json: string): VideoDescription => {
  const parsed = JSON.parse(json) as FfprobeOutput;
  const video = parsed.streams?.find((stream) => stream.codec_type === 'video');
  const audio = parsed.streams?.find((stream) => stream.codec_type === 'audio');
  const duration = Number(parsed.format?.duration);

  return {
    duration: Number.isFinite(duration) ? Math.round(duration) : undefined,
    width: video?.width,
    height: video?.height,
    videoCodec: video?.codec_name,
    audioCodec: audio?.codec_name,
  };
};
