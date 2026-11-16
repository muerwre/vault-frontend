/** How the fetcher should report a failed yt-dlp run. */
export interface FailureVerdict {
  /** Worth trying again later. */
  retryable: boolean;
  /** Likely fixed by a newer yt-dlp, so counts towards an early update. */
  extractor: boolean;
  /** The line worth showing in the backend's admin view. */
  reason: string;
}

/** Problems with the video itself: no retry will change them. */
const PERMANENT = [
  /video unavailable|video is unavailable|video is (?:no longer|not) available/i,
  /private video/i,
  /this video has been removed/i,
  /members[- ]only|join this channel/i,
  /sign in to confirm your age|age[- ]restricted|inappropriate for some users/i,
  /copyright/i,
  /account associated with this video has been terminated/i,
  /premieres in|live event will begin/i,
];

/** Signs that YouTube changed something yt-dlp has not caught up with. */
const EXTRACTOR = [
  /unable to extract/i,
  /sign in to confirm you.?re not a bot/i,
  /nsig|n challenge|signature extraction/i,
  /requested format is not available/i,
  /unable to download video data/i,
];

/** The most telling line of yt-dlp's error output. */
const reasonOf = (output: string): string => {
  const lines = output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const error = lines.filter((line) => /^ERROR:/.test(line)).pop();

  return (error ?? lines.pop() ?? 'yt-dlp failed').slice(0, 500);
};

export const classifyFailure = (output: string): FailureVerdict => {
  const reason = reasonOf(output);

  return {
    retryable: !PERMANENT.some((pattern) => pattern.test(output)),
    extractor: EXTRACTOR.some((pattern) => pattern.test(output)),
    reason,
  };
};

/** yt-dlp gave up because the file outgrew `--max-filesize`. */
export const isOverMaxFilesize = (output: string): boolean =>
  /larger than max-filesize/i.test(output);
