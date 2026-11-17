import { classifyFailure, isOverMaxFilesize } from './errors';

describe('classifyFailure', () => {
  it.each([
    'ERROR: [youtube] abc: Video unavailable. This video has been removed by the uploader',
    'ERROR: [youtube] abc: This video is unavailable',
    'ERROR: [youtube] abc: This video is no longer available because the uploader has closed their YouTube account.',
    "ERROR: [youtube] abc: Private video. Sign in if you've been granted access",
    'ERROR: [youtube] abc: Join this channel to get access to members-only content',
    'ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.',
  ])('gives up on %p', (output) => {
    expect(classifyFailure(output)).toMatchObject({
      retryable: false,
      extractor: false,
    });
  });

  it.each([
    'ERROR: [youtube] abc: Sign in to confirm you’re not a bot.',
    "ERROR: [youtube] abc: Sign in to confirm you're not a bot.",
    'ERROR: [youtube] abc: Unable to extract initial player response',
    'ERROR: Requested format is not available',
  ])('suspects an outdated yt-dlp for %p', (output) => {
    expect(classifyFailure(output)).toMatchObject({
      retryable: true,
      extractor: true,
    });
  });

  it.each([
    'ERROR: [youtube] x: Unable to download API page: HTTP Error 429: Too Many Requests',
    'ERROR: unable to download video data: HTTP Error 430',
    "ERROR: [youtube] x: Sign in to confirm you're not a bot",
  ])('notices YouTube asking to slow down in %p', (output) => {
    expect(classifyFailure(output)).toMatchObject({
      retryable: true,
      rateLimited: true,
    });
  });

  it('does not take a removed video for rate limiting', () => {
    expect(
      classifyFailure('ERROR: [youtube] x: Video unavailable').rateLimited,
    ).toBe(false);
  });

  it('retries network trouble without blaming yt-dlp', () => {
    expect(
      classifyFailure('ERROR: unable to download webpage: connection reset'),
    ).toMatchObject({ retryable: true, extractor: false, rateLimited: false });
  });

  it('reports the last ERROR line, or the last line', () => {
    expect(
      classifyFailure(
        '[youtube] abc: Downloading\nERROR: first\nERROR: second\nnoise',
      ).reason,
    ).toBe('ERROR: second');
    expect(classifyFailure('one\ntwo\n').reason).toBe('two');
    expect(classifyFailure('').reason).toBe('yt-dlp failed');
  });
});

it('recognises the max-filesize abort', () => {
  expect(
    isOverMaxFilesize(
      '[download] File is larger than max-filesize (600 bytes > 500 bytes). Aborting.',
    ),
  ).toBe(true);
  expect(isOverMaxFilesize('[download] 100%')).toBe(false);
});
