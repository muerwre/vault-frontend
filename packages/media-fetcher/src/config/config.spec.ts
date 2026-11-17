import { loadConfig } from './config';

describe('config', () => {
  const base = {
    MEDIA_BACKEND_URL: 'http://10.0.0.1:8000/api/',
    MEDIA_FETCHER_KEY: 'secret',
  };

  it('applies defaults', () => {
    expect(loadConfig(base)).toMatchObject({
      backendUrl: 'http://10.0.0.1:8000/api',
      key: 'secret',
      youtubeProxyUrl: '',
      youtubeMinIntervalMs: 60_000,
      qualityLadder: [720, 480, 360],
      idlePollMs: 1_800_000,
      updateEveryHours: 24,
      jsRuntime: 'node',
      impersonate: 'chrome',
      extractorArgs: '',
      rateLimitPauseMs: 30 * 60 * 1000,
      kinds: ['download'],
    });
  });

  it('reads the proxy and the rest', () => {
    expect(
      loadConfig({
        ...base,
        YOUTUBE_PROXY_URL: 'socks5h://proxy:1080',
        YOUTUBE_MIN_INTERVAL_SEC: '0',
        YTDLP_UPDATE_HOURS: '0',
        YTDLP_JS_RUNTIME: '',
      }),
    ).toMatchObject({
      youtubeProxyUrl: 'socks5h://proxy:1080',
      youtubeMinIntervalMs: 0,
      updateEveryHours: 0,
      jsRuntime: '',
    });
  });

  it('refuses to start without a backend or a key', () => {
    expect(() => loadConfig({ MEDIA_FETCHER_KEY: 'x' })).toThrow(
      'MEDIA_BACKEND_URL',
    );
    expect(() =>
      loadConfig({ MEDIA_BACKEND_URL: 'ftp://x', MEDIA_FETCHER_KEY: 'x' }),
    ).toThrow('MEDIA_BACKEND_URL');
    expect(() => loadConfig({ MEDIA_BACKEND_URL: 'http://x/api' })).toThrow(
      'MEDIA_FETCHER_KEY',
    );
  });
});
