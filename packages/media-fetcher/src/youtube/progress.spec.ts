import {
  parseProgressLine,
  PROGRESS_MARKER,
  ProgressTracker,
} from './progress';

const line = (percent: string) => `${PROGRESS_MARKER}  ${percent}`;
const destination = '[download] Destination: /tmp/job/video.f136.mp4';

describe('parseProgressLine', () => {
  it.each([
    [line('45.3%'), 45.3],
    [line('100.0%'), 100],
    [`[download] ${line(' 7%')}`, 7],
    ['[download]  45.3% of 10MiB', null],
    [line('N/A'), null],
  ])('reads %p', (text, percent) => {
    expect(parseProgressLine(text)).toBe(percent);
  });
});

describe('ProgressTracker', () => {
  const heartbeat = 120_000;

  it('reports at each quarter of a two-part download', () => {
    const tracker = new ProgressTracker(2, heartbeat, 0);
    const reported: number[] = [];
    const feed = (text: string) => {
      const percent = tracker.feed(text, 1);
      if (percent !== null) reported.push(percent);
    };

    feed(destination);
    ['10%', '40%', '60%', '99%', '100%'].forEach((p) => feed(line(p)));
    feed(destination);
    ['30%', '60%', '100%'].forEach((p) => feed(line(p)));

    // Completion itself is reported by the upload that follows.
    expect(reported).toEqual([30, 50, 80]);
  });

  it('sends a heartbeat when a quarter takes long', () => {
    const tracker = new ProgressTracker(1, heartbeat, 0);

    expect(tracker.feed(line('10%'), 1000)).toBeNull();
    expect(tracker.feed(line('12%'), heartbeat + 1)).toBe(12);
    expect(tracker.feed('[ffmpeg] merging', 2 * heartbeat + 2)).toBe(0);
  });
});
