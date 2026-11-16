import { mkdtempSync } from 'fs';
import { readFile, readdir, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { YoutubeThumbService } from './youtube-thumb.service';

const ID = 'dQw4w9WgXcQ';
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

const image = (body: Buffer = JPEG) =>
  new Response(body, {
    status: 200,
    headers: { 'content-type': 'image/jpeg' },
  });

/** What YouTube answers for a cover it does not have: a placeholder, but 404. */
const missing = () =>
  new Response(JPEG, {
    status: 404,
    headers: { 'content-type': 'image/jpeg' },
  });

describe('YoutubeThumbService', () => {
  let root: string;
  let fetchMock: jest.SpyInstance;
  let service: YoutubeThumbService;
  const previousRoot = process.env.UPLOADS_PATH;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'vault-yt-thumb-'));
    process.env.UPLOADS_PATH = root;
    // `.env.local` may set these; the mocks below only see a direct fetch.
    process.env.YOUTUBE_PROXY_URL = '';
    delete process.env.CACHE_YOUTUBE_THUMBS;
    fetchMock = jest.spyOn(global, 'fetch');
    service = new YoutubeThumbService();
  });

  afterEach(() => {
    fetchMock.mockRestore();
    process.env.UPLOADS_PATH = previousRoot;
  });

  const stored = () => readFile(join(root, 'youtube', `${ID}.jpg`));

  it('downloads the HD cover and stores it under youtube/', async () => {
    fetchMock.mockResolvedValueOnce(image());

    await expect(service.ensure(ID)).resolves.toBe(true);
    expect(await stored()).toEqual(JPEG);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      `https://i.ytimg.com/vi/${ID}/maxresdefault.jpg`,
    );
  });

  it('falls back to the standard cover when there is no HD one', async () => {
    fetchMock.mockResolvedValueOnce(missing()).mockResolvedValueOnce(image());

    await expect(service.ensure(ID)).resolves.toBe(true);
    expect(String(fetchMock.mock.calls[1][0])).toBe(
      `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`,
    );
  });

  it('still tries the standard cover when the HD request throws', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce(image());

    await expect(service.ensure(ID)).resolves.toBe(true);
    expect(await stored()).toEqual(JPEG);
  });

  it('runs at most four downloads at once', async () => {
    let inFlight = 0;
    let peak = 0;

    fetchMock.mockImplementation(async () => {
      inFlight += 1;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight -= 1;
      return image();
    });

    const ids = 'abcdefghij'.split('').map((c) => c.repeat(11));
    const results = await Promise.all(ids.map((id) => service.ensure(id)));

    expect(results.every(Boolean)).toBe(true);
    expect(peak).toBe(4);
  });

  it('never fetches a cover that is already on disk', async () => {
    await mkdir(join(root, 'youtube'), { recursive: true });
    await writeFile(join(root, 'youtube', `${ID}.jpg`), JPEG);

    await expect(service.ensure(ID)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shares one download between concurrent requests', async () => {
    fetchMock.mockImplementation(async () => image());

    const results = await Promise.all([
      service.ensure(ID),
      service.ensure(ID),
      service.ensure(ID),
    ]);

    expect(results).toEqual([true, true, true]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does nothing while the cover cache is off', async () => {
    process.env.CACHE_YOUTUBE_THUMBS = 'false';

    try {
      await expect(service.ensure(ID)).resolves.toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      delete process.env.CACHE_YOUTUBE_THUMBS;
    }
  });

  it('rejects an invalid id without touching the network', async () => {
    await expect(service.ensure('../../etc')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not store a response that is not an image', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html/>', {
        status: 200,
        headers: { 'content-type': 'text/html' },
      }),
    );

    await expect(service.ensure(ID)).resolves.toBe(false);
    await expect(stored()).rejects.toThrow();
  });

  it('backs off after a failure instead of retrying every request', async () => {
    fetchMock.mockResolvedValue(missing());

    await expect(service.ensure(ID)).resolves.toBe(false);
    const calls = fetchMock.mock.calls.length;

    await expect(service.ensure(ID)).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(calls);
  });

  it('survives a network error and leaves no partial file', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));

    await expect(service.ensure(ID)).resolves.toBe(false);
    await expect(readdir(join(root, 'youtube'))).rejects.toThrow();
  });
});
