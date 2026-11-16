import {
  extractMediaRefs,
  mediaRefKey,
  parseMediaRefKey,
  parseMediaUrl,
  YOUTUBE_PROVIDER,
} from '@vault/common/media';

const ID = 'dQw4w9WgXcQ';

describe('media providers', () => {
  describe('parseMediaUrl / youtube', () => {
    it.each([
      `https://www.youtube.com/watch?v=${ID}`,
      `http://youtube.com/watch?v=${ID}&t=42`,
      `https://m.youtube.com/watch?feature=share&v=${ID}`,
      `https://music.youtube.com/watch?v=${ID}&list=RD`,
      `https://www.youtube.com/watch?feature=player_detailpage&amp;v=${ID}#t=1`,
      `https://www.youtube.com/watch?v=?feature=player_embedded&v=${ID}`,
      `www.youtube.com/watch?v=${ID}`,
      `youtube.com?v=${ID}`,
      `https://youtu.be/${ID}`,
      `https://youtu.be/${ID}?si=abc&t=10`,
      `youtu.be/${ID}`,
      `https://www.youtube.com/embed/${ID}?autoplay=1`,
      `https://www.youtube-nocookie.com/embed/${ID}`,
      `https://www.youtube.com/v/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/live/${ID}?feature=shared`,
    ])('finds the id in %s', (url) => {
      expect(parseMediaUrl(url)).toEqual({ provider: 'youtube', id: ID });
    });

    it.each([
      '',
      'not a url',
      'https://vimeo.com/12345',
      'https://www.youtube.com/channel/UCabcdefghijk',
      'https://www.youtube.com/watch?v=short',
      `https://www.youtube.com/watch?v=${ID}p`,
      `https://notyoutube.com/watch?v=${ID}`,
      `https://youtube.com.evil.example/watch?v=${ID}`,
    ])('finds nothing in %s', (url) => {
      expect(parseMediaUrl(url)).toBeNull();
    });
  });

  describe('extractMediaRefs', () => {
    it('finds every link in free text, once each, in order', () => {
      const other = 'abcdefghijk';
      const text = [
        `смотри https://youtu.be/${ID}, и ещё`,
        `(www.youtube.com/watch?v=${other})`,
        `и снова https://www.youtube.com/watch?v=${ID}&t=5`,
      ].join('\n');

      expect(extractMediaRefs(text)).toEqual([
        { provider: 'youtube', id: ID },
        { provider: 'youtube', id: other },
      ]);
    });

    it('ignores links that carry no id', () => {
      expect(
        extractMediaRefs('https://www.youtube.com/ and https://youtu.be/'),
      ).toEqual([]);
    });

    it('tolerates empty input', () => {
      expect(extractMediaRefs('')).toEqual([]);
      expect(extractMediaRefs(undefined as unknown as string)).toEqual([]);
    });

    it('is safe to call repeatedly with the shared global pattern', () => {
      const text = `https://youtu.be/${ID}`;

      expect(extractMediaRefs(text)).toHaveLength(1);
      expect(extractMediaRefs(text)).toHaveLength(1);
    });
  });

  describe('ref keys', () => {
    it('round-trips', () => {
      const ref = { provider: 'youtube' as const, id: ID };

      expect(mediaRefKey(ref)).toBe(`youtube:${ID}`);
      expect(parseMediaRefKey(mediaRefKey(ref))).toEqual(ref);
    });

    it.each(['', ID, `vimeo:${ID}`, 'youtube:short', `:${ID}`])(
      'rejects %s',
      (key) => {
        expect(parseMediaRefKey(key)).toBeNull();
      },
    );
  });

  it('builds youtube urls from an id', () => {
    expect(YOUTUBE_PROVIDER.canonicalUrl(ID)).toBe(
      `https://www.youtube.com/watch?v=${ID}`,
    );
    expect(YOUTUBE_PROVIDER.embedUrl(ID)).toBe(
      `https://www.youtube.com/embed/${ID}`,
    );
  });
});
