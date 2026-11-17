import { estimateBytes, isLive, pickFormat, type YtFormat } from './formats';

const MB = 1024 * 1024;

/** A YouTube-like offer: H.264 video-only per height, AAC and Opus audio. */
const formats: YtFormat[] = [
  {
    format_id: '18',
    ext: 'mp4',
    vcodec: 'avc1.42001E',
    acodec: 'mp4a.40.2',
    height: 360,
    tbr: 500,
  },
  {
    format_id: '134',
    ext: 'mp4',
    vcodec: 'avc1.4d401e',
    acodec: 'none',
    height: 360,
    filesize: 20 * MB,
  },
  {
    format_id: '135',
    ext: 'mp4',
    vcodec: 'avc1.4d401f',
    acodec: 'none',
    height: 480,
    filesize: 40 * MB,
  },
  {
    format_id: '136',
    ext: 'mp4',
    vcodec: 'avc1.64001f',
    acodec: 'none',
    height: 720,
    filesize_approx: 90 * MB,
  },
  {
    format_id: '137',
    ext: 'mp4',
    vcodec: 'avc1.640028',
    acodec: 'none',
    height: 1080,
    filesize: 200 * MB,
  },
  {
    format_id: '248',
    ext: 'webm',
    vcodec: 'vp9',
    acodec: 'none',
    height: 1080,
    filesize: 150 * MB,
  },
  {
    format_id: '140',
    ext: 'm4a',
    vcodec: 'none',
    acodec: 'mp4a.40.2',
    abr: 129,
    filesize: 5 * MB,
  },
  {
    format_id: '139',
    ext: 'm4a',
    vcodec: 'none',
    acodec: 'mp4a.40.5',
    abr: 48,
    filesize: 2 * MB,
  },
  {
    format_id: '251',
    ext: 'webm',
    vcodec: 'none',
    acodec: 'opus',
    abr: 160,
    filesize: 6 * MB,
  },
  { format_id: 'sb0', ext: 'mhtml', vcodec: 'none', acodec: 'none' },
];

const info = { id: 'x', duration: 600, formats };
const ladder = [720, 480, 360];

describe('pickFormat', () => {
  it('takes the best H.264 + AAC pair at the top rung when it fits', () => {
    expect(pickFormat(info, ladder, 500 * MB)).toEqual({
      kind: 'download',
      spec: '136+140',
      height: 720,
      estimatedBytes: 95 * MB,
      rung: 0,
    });
  });

  it('steps down the ladder until the estimate fits', () => {
    expect(pickFormat(info, ladder, 50 * MB)).toMatchObject({
      spec: '135+140',
      height: 480,
      rung: 1,
    });
  });

  it('falls back to the single combined file when the pair does not fit', () => {
    // The 360p pair is 25 MB; format 18 at 500 kbit/s × 600 s is 37.5 MB.
    expect(pickFormat(info, ladder, 24 * MB)).toEqual({
      kind: 'too_big',
      estimatedBytes: 25 * MB,
    });
    // Over 60 s, format 18 is under 4 MB while the pair is still 25 MB.
    expect(pickFormat({ ...info, duration: 60 }, [360], 24 * MB)).toMatchObject(
      {
        spec: '18',
      },
    );
  });

  it('never skips a rung for a lower-quality file', () => {
    // Format 18 (360p) fits at 50 MB, but the 480p pair fits too.
    expect(pickFormat(info, ladder, 50 * MB)).toMatchObject({ height: 480 });
  });

  it('starts below a rung that already proved too big', () => {
    expect(pickFormat(info, ladder, 500 * MB, 1)).toMatchObject({
      spec: '135+140',
      rung: 1,
    });
  });

  it('reports the smallest estimate when nothing fits', () => {
    expect(pickFormat(info, ladder, 10 * MB)).toEqual({
      kind: 'too_big',
      estimatedBytes: 25 * MB,
    });
  });

  it('uses the combined file when there are no separate streams', () => {
    expect(
      pickFormat(
        { id: 'x', duration: 60, formats: [formats[0]] },
        ladder,
        500 * MB,
      ),
    ).toMatchObject({ spec: '18', height: 360 });
  });

  it('trusts formats whose size cannot be estimated', () => {
    expect(
      pickFormat(
        {
          id: 'x',
          formats: [
            { format_id: 'v', vcodec: 'avc1', acodec: 'none', height: 720 },
            { format_id: 'a', vcodec: 'none', acodec: 'mp4a.40.2' },
          ],
        },
        ladder,
        MB,
      ),
    ).toMatchObject({ spec: 'v+a', estimatedBytes: 0 });
  });

  it('finds nothing without H.264 and AAC', () => {
    expect(
      pickFormat(
        { id: 'x', duration: 60, formats: [formats[5], formats[8]] },
        ladder,
        500 * MB,
      ),
    ).toEqual({ kind: 'no_format' });
  });
});

describe('estimateBytes', () => {
  it('prefers the stated size, then the approximation, then the bitrate', () => {
    expect(
      estimateBytes(
        { format_id: 'a', filesize: 1, filesize_approx: 2, tbr: 3 },
        10,
      ),
    ).toBe(1);
    expect(
      estimateBytes({ format_id: 'a', filesize_approx: 2, tbr: 3 }, 10),
    ).toBe(2);
    expect(estimateBytes({ format_id: 'a', tbr: 800 }, 10)).toBe(1_000_000);
    expect(estimateBytes({ format_id: 'a', tbr: 800 }, null)).toBeNull();
  });
});

describe('isLive', () => {
  it.each([
    [{ is_live: true }, true],
    [{ live_status: 'is_upcoming' }, true],
    [{ live_status: 'was_live' }, false],
    [{}, false],
  ])('reads %p', (fields, live) => {
    expect(isLive({ id: 'x', ...fields })).toBe(live);
  });
});
