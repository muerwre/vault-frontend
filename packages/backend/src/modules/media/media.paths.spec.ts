import { mediaThumbPath, mediaVideoPath } from './media.paths';

describe('media paths', () => {
  it('keeps videos under media/<provider>', () => {
    expect(mediaVideoPath('youtube', 'dQw4w9WgXcQ')).toBe(
      'media/youtube/dQw4w9WgXcQ.mp4',
    );
  });

  it('keeps YouTube covers where they were already served from', () => {
    expect(mediaThumbPath('youtube', 'dQw4w9WgXcQ')).toBe(
      'youtube/dQw4w9WgXcQ.jpg',
    );
  });

  it.each(['../../etc/pass', 'short', 'dQw4w9WgXc/', ''])(
    'refuses the id %p',
    (id) => {
      expect(() => mediaVideoPath('youtube', id)).toThrow();
      expect(() => mediaThumbPath('youtube', id)).toThrow();
    },
  );
});
