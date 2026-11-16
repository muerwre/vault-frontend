import {
  cachePathFor,
  generateUploadName,
  isMimeAllowedForType,
  isUploadTargetAllowed,
  isUploadTypeAllowed,
  isYoutubeId,
  localizeYoutubeThumb,
  needsScaling,
  parseCacheRequest,
  parseYoutubeThumbPath,
  remoteYoutubeThumbUrl,
  remoteFileName,
  resolveUploadPath,
  youtubeThumbPath,
} from './upload.paths';

const AT = new Date('2026-05-03T12:00:00.000Z');
const STAMP = Math.floor(AT.getTime() / 1000);

describe('upload paths', () => {
  describe('generateUploadName', () => {
    it('lays out uploads/<year>/<month>/<type>', () => {
      expect(generateUploadName('pic.jpg', 'image', AT).path).toBe(
        'uploads/2026/5/image',
      );
    });

    /** The month is not zero-padded, matching existing rows. */
    it('does not zero-pad the month', () => {
      const january = new Date('2026-01-09T00:00:00.000Z');

      expect(generateUploadName('pic.jpg', 'image', january).path).toBe(
        'uploads/2026/1/image',
      );
    });

    it('appends a unix-seconds stamp before the extension', () => {
      expect(generateUploadName('pic.jpg', 'image', AT).name).toBe(
        `pic-${STAMP}.jpg`,
      );
    });

    it('leaves an extensionless name without one', () => {
      expect(generateUploadName('avatar=s96-c', 'image', AT).name).toBe(
        `avatar=s96-c-${STAMP}`,
      );
    });

    it('preserves non-ascii names', () => {
      expect(generateUploadName('яблоки.png', 'image', AT).name).toBe(
        `яблоки-${STAMP}.png`,
      );
    });

    it('keeps spaces and dots inside the base name', () => {
      expect(generateUploadName('парк март 006.jpg', 'image', AT).name).toBe(
        `парк март 006-${STAMP}.jpg`,
      );
      expect(generateUploadName('a.b.c.png', 'image', AT).name).toBe(
        `a.b.c-${STAMP}.png`,
      );
    });

    /** A client-supplied path must not escape the generated directory. */
    it('strips any directory component', () => {
      expect(generateUploadName('../../etc/passwd', 'image', AT).name).toBe(
        `passwd-${STAMP}`,
      );
      expect(generateUploadName('/tmp/evil.jpg', 'image', AT).name).toBe(
        `evil-${STAMP}.jpg`,
      );
    });

    it('builds full_path and url from path and name', () => {
      const generated = generateUploadName('pic.jpg', 'image', AT);

      expect(generated.fullPath).toBe(`uploads/2026/5/image/pic-${STAMP}.jpg`);
      expect(generated.url).toBe(
        `REMOTE_CURRENT://uploads/2026/5/image/pic-${STAMP}.jpg`,
      );
    });

    it('files audio under its own type directory', () => {
      expect(generateUploadName('track.mp3', 'audio', AT).path).toBe(
        'uploads/2026/5/audio',
      );
    });
  });

  describe('type, target and mime rules', () => {
    it('allows only image and audio uploads', () => {
      expect(isUploadTypeAllowed('image')).toBe(true);
      expect(isUploadTypeAllowed('audio')).toBe(true);
      expect(isUploadTypeAllowed('video')).toBe(false);
      expect(isUploadTypeAllowed('text')).toBe(false);
    });

    it('allows the four known targets', () => {
      for (const target of ['nodes', 'comments', 'profiles', 'other']) {
        expect(isUploadTargetAllowed(target)).toBe(true);
      }
      expect(isUploadTargetAllowed('elsewhere')).toBe(false);
    });

    it('matches mimes against the declared type', () => {
      expect(isMimeAllowedForType('image', 'image/jpeg')).toBe(true);
      expect(isMimeAllowedForType('image', 'image/svg+xml')).toBe(true);
      expect(isMimeAllowedForType('image', 'audio/mp3')).toBe(false);
      expect(isMimeAllowedForType('audio', 'audio/mpeg')).toBe(true);
      expect(isMimeAllowedForType('audio', 'image/png')).toBe(false);
    });

    it('rejects an unknown mime outright', () => {
      expect(isMimeAllowedForType('image', 'application/zip')).toBe(false);
    });
  });

  describe('needsScaling', () => {
    it('excludes svg and includes raster formats', () => {
      expect(needsScaling('image/svg+xml')).toBe(false);
      expect(needsScaling('image/jpeg')).toBe(true);
      expect(needsScaling('image/png')).toBe(true);
    });
  });

  describe('resolveUploadPath', () => {
    const root = '/srv/uploads';

    it('resolves a path inside the root', () => {
      expect(resolveUploadPath(root, 'uploads/2026/5/image/a.jpg')).toBe(
        '/srv/uploads/uploads/2026/5/image/a.jpg',
      );
    });

    it('tolerates a leading slash', () => {
      expect(resolveUploadPath(root, '/uploads/a.jpg')).toBe(
        '/srv/uploads/uploads/a.jpg',
      );
    });

    /** Traversal must not reach outside the uploads root. */
    it('refuses relative paths that escape the root', () => {
      expect(resolveUploadPath(root, '../etc/passwd')).toBeNull();
      expect(resolveUploadPath(root, 'uploads/../../etc/passwd')).toBeNull();
      expect(resolveUploadPath(root, '../../../../etc/passwd')).toBeNull();
    });

    /**
     * An absolute-looking request is re-rooted inside the uploads directory
     * rather than refused, which is how a static server should read it.
     */
    it('re-roots absolute-looking paths inside the root', () => {
      expect(resolveUploadPath(root, '/../../etc/passwd')).toBe(
        '/srv/uploads/etc/passwd',
      );
      expect(resolveUploadPath(root, '/etc/passwd')).toBe(
        '/srv/uploads/etc/passwd',
      );
    });

    it('refuses everything when no root is configured', () => {
      expect(resolveUploadPath('', 'a.jpg')).toBeNull();
    });
  });

  describe('remoteFileName', () => {
    it('takes the last path segment', () => {
      expect(
        remoteFileName('https://example.com/a/b/pic.jpg', 'image/jpeg'),
      ).toBe('pic.jpg');
    });

    /** Provider avatar URLs often carry a query string. */
    it('ignores the query string', () => {
      expect(
        remoteFileName(
          'https://example.com/pic.jpg?size=200&v=2',
          'image/jpeg',
        ),
      ).toBe('pic.jpg');
    });

    it('derives an extension from the mime when the url has none', () => {
      expect(remoteFileName('https://example.com/avatar', 'image/png')).toBe(
        'avatar.png',
      );
      expect(
        remoteFileName('https://sun1.userapi.com/s/v1/if1/abc', 'image/jpeg'),
      ).toBe('abc.jpg');
    });

    it('leaves the name bare for an unrecognised mime', () => {
      expect(
        remoteFileName('https://example.com/avatar', 'image/unknown'),
      ).toBe('avatar');
    });

    it('falls back to a placeholder when there is no segment', () => {
      expect(remoteFileName('https://example.com/', 'image/png')).toBe(
        'file.png',
      );
    });

    it('handles a value that is not a url', () => {
      expect(remoteFileName('just-a-name.png', 'image/png')).toBe(
        'just-a-name.png',
      );
    });
  });

  describe('cache paths', () => {
    it('nests variants under cache/<preset>/<src>', () => {
      expect(cachePathFor('avatar', 'uploads/2026/5/image/a.jpg')).toBe(
        'cache/avatar/uploads/2026/5/image/a.jpg',
      );
    });

    it('parses a cache request', () => {
      expect(parseCacheRequest('cache/avatar/uploads/a.jpg')).toEqual({
        preset: 'avatar',
        src: 'uploads/a.jpg',
      });
    });

    it('returns null for a plain static path', () => {
      expect(parseCacheRequest('uploads/2026/5/image/a.jpg')).toBeNull();
      expect(parseCacheRequest('cache/avatar')).toBeNull();
    });

    it('decodes percent-encoded segments', () => {
      expect(parseCacheRequest('cache/avatar/uploads/%D1%8F.jpg')).toEqual({
        preset: 'avatar',
        src: 'uploads/я.jpg',
      });
    });
  });

  describe('youtube thumbnails', () => {
    it('accepts an 11-character id only', () => {
      expect(isYoutubeId('dQw4w9WgXcQ')).toBe(true);
      expect(isYoutubeId('a-b_c-d_e-f')).toBe(true);
      expect(isYoutubeId('short')).toBe(false);
      expect(isYoutubeId('dQw4w9WgXcQx')).toBe(false);
      expect(isYoutubeId('../../etc/x')).toBe(false);
    });

    it('stores a cover at youtube/<id>.jpg', () => {
      expect(youtubeThumbPath('dQw4w9WgXcQ')).toBe('youtube/dQw4w9WgXcQ.jpg');
    });

    it('parses the id back out of that path', () => {
      expect(parseYoutubeThumbPath('youtube/dQw4w9WgXcQ.jpg')).toBe(
        'dQw4w9WgXcQ',
      );
      expect(parseYoutubeThumbPath('/youtube/dQw4w9WgXcQ.jpg')).toBe(
        'dQw4w9WgXcQ',
      );
    });

    it('points a stored YouTube cover at the local copy', () => {
      expect(
        localizeYoutubeThumb(
          'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        ),
      ).toBe('REMOTE_CURRENT://youtube/dQw4w9WgXcQ.jpg');
    });

    it('round-trips with the remote url', () => {
      expect(localizeYoutubeThumb(remoteYoutubeThumbUrl('a-b_c-d_e-f'))).toBe(
        'REMOTE_CURRENT://youtube/a-b_c-d_e-f.jpg',
      );
    });

    it('leaves every other thumbnail alone', () => {
      for (const value of [
        '',
        'REMOTE_CURRENT://uploads/2026/5/image/a.jpg',
        'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        'https://i.ytimg.com/vi/short/hqdefault.jpg',
        'https://example.com/i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      ]) {
        expect(localizeYoutubeThumb(value)).toBe(value);
      }
    });

    it('ignores anything else', () => {
      expect(parseYoutubeThumbPath('uploads/2026/5/image/a.jpg')).toBeNull();
      expect(parseYoutubeThumbPath('youtube/dQw4w9WgXcQ.png')).toBeNull();
      expect(parseYoutubeThumbPath('youtube/short.jpg')).toBeNull();
      expect(parseYoutubeThumbPath('youtube/x/dQw4w9WgXcQ.jpg')).toBeNull();
    });
  });
});
