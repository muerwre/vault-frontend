import { createServer, type IncomingMessage, type Server } from 'http';
import type { AddressInfo } from 'net';

import { youtubeFetch } from './youtube-fetch';

describe('youtubeFetch', () => {
  // `.env.local` may set a proxy; each case decides for itself.
  beforeEach(() => {
    process.env.YOUTUBE_PROXY_URL = '';
  });

  afterEach(() => {
    delete process.env.YOUTUBE_PROXY_URL;
  });

  it('uses the plain global fetch when no proxy is set', async () => {
    const spy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('direct'));

    try {
      const response = await youtubeFetch('https://i.ytimg.com/vi/x/a.jpg');

      expect(await response.text()).toBe('direct');
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  describe('through an http proxy', () => {
    let proxy: Server;
    let seen: IncomingMessage[];

    beforeAll(async () => {
      seen = [];
      proxy = createServer((request, response) => {
        seen.push(request);
        response.end('via proxy');
      });
      await new Promise<void>((resolve) =>
        proxy.listen(0, '127.0.0.1', resolve),
      );
    });

    afterAll(
      () => new Promise<void>((resolve) => proxy.close(() => resolve())),
    );

    it('sends the request to the proxy', async () => {
      const { port } = proxy.address() as AddressInfo;
      process.env.YOUTUBE_PROXY_URL = `http://127.0.0.1:${port}`;

      const response = await youtubeFetch('http://youtube.invalid/thumb.jpg');

      expect(await response.text()).toBe('via proxy');
      // A forward proxy is asked for the absolute url.
      expect(seen[0].url).toBe('http://youtube.invalid/thumb.jpg');
    });
  });

  it('falls back to a direct connection when the proxy url is malformed', async () => {
    process.env.YOUTUBE_PROXY_URL = 'ftp://nope:21';
    const spy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('direct'));

    try {
      await youtubeFetch('https://i.ytimg.com/vi/x/a.jpg');
      expect(spy).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });
});
