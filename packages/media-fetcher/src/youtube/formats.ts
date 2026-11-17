/** The parts of yt-dlp's `-J` output the fetcher reads. */
export interface YtFormat {
  format_id: string;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  height?: number | null;
  tbr?: number | null;
  vbr?: number | null;
  abr?: number | null;
  filesize?: number | null;
  filesize_approx?: number | null;
}

export interface YtInfo {
  id: string;
  title?: string | null;
  duration?: number | null;
  is_live?: boolean | null;
  live_status?: string | null;
  formats?: YtFormat[];
}

export type FormatChoice =
  | {
      kind: 'download';
      /** Passed to `-f`. */
      spec: string;
      height: number;
      estimatedBytes: number;
      /** Index into the ladder; the next attempt starts below it. */
      rung: number;
    }
  | { kind: 'too_big'; estimatedBytes: number }
  | { kind: 'no_format' };

const isH264 = (format: YtFormat) => (format.vcodec ?? '').startsWith('avc1');
const isAac = (format: YtFormat) => (format.acodec ?? '').startsWith('mp4a');
const hasNo = (codec: string | undefined) => !codec || codec === 'none';

/**
 * Bytes a format will take: the size YouTube states, its own estimate, or
 * bitrate × duration. Null when none of those is known.
 */
export const estimateBytes = (
  format: YtFormat,
  duration: number | null | undefined,
): number | null => {
  if (format.filesize) {
    return format.filesize;
  }

  if (format.filesize_approx) {
    return format.filesize_approx;
  }

  const kbps = format.tbr ?? format.vbr ?? format.abr;

  return kbps && duration ? Math.round((kbps * 1000 * duration) / 8) : null;
};

const better = (a: YtFormat, b: YtFormat) =>
  (b.height ?? 0) - (a.height ?? 0) || (b.tbr ?? 0) - (a.tbr ?? 0);

/** Heights a rung covers: up to its own, above the next rung's. */
interface Band {
  max: number;
  min: number;
}

const inBand = (format: YtFormat, band: Band) =>
  (format.height ?? 0) > band.min && (format.height ?? 0) <= band.max;

/** Separate H.264 video and AAC audio streams, merged into one mp4. */
const splitIn = (formats: YtFormat[], band: Band) => {
  const video = formats
    .filter(
      (format) =>
        isH264(format) && hasNo(format.acodec) && inBand(format, band),
    )
    .sort(better)[0];
  const audio = formats
    .filter((format) => isAac(format) && hasNo(format.vcodec))
    .sort((a, b) => (b.abr ?? b.tbr ?? 0) - (a.abr ?? a.tbr ?? 0))[0];

  return video && audio ? [video, audio] : null;
};

/** A single H.264 + AAC file, which YouTube offers at low heights. */
const combinedIn = (formats: YtFormat[], band: Band) =>
  formats
    .filter((format) => isH264(format) && isAac(format) && inBand(format, band))
    .sort(better)[0];

/**
 * The best H.264/AAC download whose estimated size fits `maxBytes`, trying each
 * rung of the ladder from `fromRung` down. A rung covers the heights above the
 * next rung, so a lower quality is never chosen while a higher rung could
 * still fit. A rung with no such formats is passed over; when formats exist
 * but none fits, the video is too big.
 */
export const pickFormat = (
  info: YtInfo,
  ladder: number[],
  maxBytes: number,
  fromRung = 0,
): FormatChoice => {
  const formats = info.formats ?? [];
  let smallest: number | null = null;

  for (let rung = fromRung; rung < ladder.length; rung += 1) {
    const band = { max: ladder[rung], min: ladder[rung + 1] ?? 0 };
    const split = splitIn(formats, band);
    const combined = combinedIn(formats, band);

    const options = [
      split && {
        spec: split.map((format) => format.format_id).join('+'),
        height: split[0].height ?? 0,
        parts: split,
      },
      combined && {
        spec: combined.format_id,
        height: combined.height ?? 0,
        parts: [combined],
      },
    ].filter(Boolean) as Array<{
      spec: string;
      height: number;
      parts: YtFormat[];
    }>;

    for (const option of options) {
      const sizes = option.parts.map((part) =>
        estimateBytes(part, info.duration),
      );
      // An unknown size is taken on trust; the download's own cap still holds.
      const estimated = sizes.every((size) => size === null)
        ? 0
        : sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0);

      if (estimated <= maxBytes) {
        return {
          kind: 'download',
          spec: option.spec,
          height: option.height,
          estimatedBytes: estimated,
          rung,
        };
      }

      smallest = smallest === null ? estimated : Math.min(smallest, estimated);
    }
  }

  return smallest === null
    ? { kind: 'no_format' }
    : { kind: 'too_big', estimatedBytes: smallest };
};

/** Whether yt-dlp's description is of a stream rather than a video. */
export const isLive = (info: YtInfo): boolean =>
  Boolean(info.is_live) ||
  ['is_live', 'is_upcoming'].includes(info.live_status ?? '');
