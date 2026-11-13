import type { File } from '../../entities/file.entity';

import {
  canHaveBlock,
  canHaveFile,
  deriveDescription,
  deriveDominantColor,
  deriveThumbnail,
  filterBlocks,
  filterFiles,
  getThumbFromUrl,
  isBlockValid,
  truncateTitle,
  validateNodeContent,
} from './node.content';

const file = (type: string, extra: Partial<File> = {}): File =>
  ({ id: 1, type, url: 'u', metadata: {}, ...extra }) as File;

const textBlock = (text: string) => ({ type: 'text' as const, text });
const videoBlock = (url: string) => ({ type: 'video' as const, url });

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

describe('node content rules', () => {
  describe('getThumbFromUrl', () => {
    it.each([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://youtube.com/v/dQw4w9WgXcQ',
    ])('extracts the id from %s', (url) => {
      expect(getThumbFromUrl(url)).toBe(
        'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      );
    });

    it('returns empty for an unsupported or malformed url', () => {
      expect(getThumbFromUrl('https://vimeo.com/12345')).toBe('');
      expect(getThumbFromUrl('not a url')).toBe('');
      expect(getThumbFromUrl('')).toBe('');
    });
  });

  describe('block rules', () => {
    it('lets a text node carry only text blocks', () => {
      expect(canHaveBlock('text', textBlock('x'))).toBe(true);
      expect(canHaveBlock('text', videoBlock(YT))).toBe(false);
    });

    it('lets a video node carry only video blocks', () => {
      expect(canHaveBlock('video', videoBlock(YT))).toBe(true);
      expect(canHaveBlock('video', textBlock('x'))).toBe(false);
    });

    /** Image and audio nodes carry no blocks at all. */
    it('gives image and audio nodes no blocks', () => {
      for (const type of ['image', 'audio'] as const) {
        expect(canHaveBlock(type, textBlock('x'))).toBe(false);
        expect(canHaveBlock(type, videoBlock(YT))).toBe(false);
      }
    });

    it('requires text blocks to have text', () => {
      expect(isBlockValid(textBlock('hello'))).toBe(true);
      expect(isBlockValid(textBlock(''))).toBe(false);
    });

    /** A video block is only valid if a thumbnail can be derived from its url. */
    it('requires video blocks to have a recognisable url', () => {
      expect(isBlockValid(videoBlock(YT))).toBe(true);
      expect(isBlockValid(videoBlock('https://vimeo.com/1'))).toBe(false);
      expect(isBlockValid(videoBlock(''))).toBe(false);
    });

    it('filters out blocks the type cannot carry and invalid ones', () => {
      expect(
        filterBlocks('text', [
          textBlock('keep'),
          textBlock(''),
          videoBlock(YT),
        ]),
      ).toEqual([textBlock('keep')]);
    });

    it('tolerates a null block list', () => {
      expect(filterBlocks('text', null)).toEqual([]);
    });
  });

  describe('file rules', () => {
    it('lets an image node carry only images', () => {
      expect(canHaveFile('image', file('image'))).toBe(true);
      expect(canHaveFile('image', file('audio'))).toBe(false);
    });

    /** Audio nodes accept a cover image alongside the audio. */
    it('lets an audio node carry audio and images', () => {
      expect(canHaveFile('audio', file('audio'))).toBe(true);
      expect(canHaveFile('audio', file('image'))).toBe(true);
    });

    it('gives text and video nodes no files', () => {
      for (const type of ['text', 'video'] as const) {
        expect(canHaveFile(type, file('image'))).toBe(false);
      }
    });

    it('filters a mixed list by node type', () => {
      const files = [file('image', { id: 1 }), file('audio', { id: 2 })];

      expect(filterFiles('image', files).map((f) => f.id)).toEqual([1]);
      expect(filterFiles('audio', files).map((f) => f.id)).toEqual([1, 2]);
    });
  });

  describe('validateNodeContent', () => {
    it('requires an image for an image node', () => {
      expect(validateNodeContent('image', [file('image')], [])).toBeNull();
      expect(validateNodeContent('image', [], [])).toEqual(expect.any(String));
    });

    /**
     * Audio requires only the file. Requiring a block would make audio nodes
     * uncreatable, since blocks are filtered out for this type.
     */
    it('requires an audio file for an audio node, with no block', () => {
      expect(validateNodeContent('audio', [file('audio')], [])).toBeNull();
      expect(validateNodeContent('audio', [file('image')], [])).toEqual(
        expect.any(String),
      );
      expect(validateNodeContent('audio', [], [])).toEqual(expect.any(String));
    });

    it('requires a text block for a text node', () => {
      expect(validateNodeContent('text', [], [textBlock('x')])).toBeNull();
      expect(validateNodeContent('text', [], [])).toEqual(expect.any(String));
    });

    it('requires a video block for a video node', () => {
      expect(validateNodeContent('video', [], [videoBlock(YT)])).toBeNull();
      expect(validateNodeContent('video', [], [])).toEqual(expect.any(String));
    });

    it('rejects a type it has no rules for', () => {
      expect(validateNodeContent('boris' as never, [], [])).toEqual(
        expect.any(String),
      );
    });
  });

  describe('truncateTitle', () => {
    it('truncates rather than rejecting', () => {
      expect(truncateTitle('x'.repeat(300))).toHaveLength(255);
    });

    it('leaves a short title alone', () => {
      expect(truncateTitle('short')).toBe('short');
    });
  });

  describe('deriveDescription', () => {
    /** Only long enough text is worth showing as a description. */
    it('uses a long first text block on a text node', () => {
      const long = 'x'.repeat(100);

      expect(deriveDescription('text', [textBlock(long)], '')).toBe(long);
    });

    it('keeps the current value when the block is too short', () => {
      expect(deriveDescription('text', [textBlock('short')], 'kept')).toBe(
        'kept',
      );
    });

    it('never touches other node types', () => {
      expect(
        deriveDescription('image', [textBlock('x'.repeat(100))], 'kept'),
      ).toBe('kept');
    });
  });

  describe('deriveThumbnail', () => {
    it('uses the first image for image and audio nodes', () => {
      const files = [
        file('audio', { id: 1 }),
        file('image', { id: 2, url: 'pic' }),
      ];

      expect(deriveThumbnail('image', files, [], '')).toBe('pic');
      expect(deriveThumbnail('audio', files, [], '')).toBe('pic');
    });

    it('derives from the video block for a video node', () => {
      expect(deriveThumbnail('video', [], [videoBlock(YT)], '')).toBe(
        'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      );
    });

    it('keeps the current value when nothing can be derived', () => {
      expect(deriveThumbnail('image', [], [], 'kept')).toBe('kept');
      expect(deriveThumbnail('video', [], [], 'kept')).toBe('kept');
      expect(deriveThumbnail('text', [], [], 'kept')).toBe('kept');
    });
  });

  describe('deriveDominantColor', () => {
    it('takes the colour from the first image', () => {
      const files = [
        file('image', { id: 1, metadata: { dominant_color: '#abcdef' } }),
      ];

      expect(deriveDominantColor('image', files, '')).toBe('#abcdef');
    });

    it('keeps the current value when the image has none', () => {
      expect(deriveDominantColor('image', [file('image')], '#old')).toBe(
        '#old',
      );
    });

    it('never touches text or video nodes', () => {
      const files = [
        file('image', { id: 1, metadata: { dominant_color: '#abcdef' } }),
      ];

      expect(deriveDominantColor('text', files, '#old')).toBe('#old');
    });
  });
});
