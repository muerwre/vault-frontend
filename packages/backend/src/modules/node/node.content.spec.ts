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
  keptFiles,
  resolveSettings,
  truncateTitle,
  validateNodeContent,
} from './node.content';

const file = (type: string, extra: Partial<File> = {}): File =>
  ({ id: 1, type, url: 'u', metadata: {}, ...extra }) as File;

const textBlock = (text: string) => ({ type: 'text' as const, text });
const videoBlock = (url: string) => ({ type: 'video' as const, url });
const imagesBlock = (files: number[]) => ({
  type: 'images' as const,
  mode: 'grid' as const,
  files,
});
const audioBlock = (files: number[]) => ({ type: 'audio' as const, files });

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
    it('lets a text node carry text, video, photo and song blocks', () => {
      expect(canHaveBlock('text', textBlock('x'))).toBe(true);
      expect(canHaveBlock('text', videoBlock(YT))).toBe(true);
      expect(canHaveBlock('text', imagesBlock([1]))).toBe(true);
      expect(canHaveBlock('text', audioBlock([1]))).toBe(true);
      expect(canHaveBlock('text', { type: 'webm' } as never)).toBe(false);
    });

    it('lets a video node carry only video blocks', () => {
      expect(canHaveBlock('video', videoBlock(YT))).toBe(true);
      expect(canHaveBlock('video', textBlock('x'))).toBe(false);
      expect(canHaveBlock('video', imagesBlock([1]))).toBe(false);
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
      expect(isBlockValid(textBlock('  \n '))).toBe(false);
    });

    /** A video block is only valid if a thumbnail can be derived from its url. */
    it('requires video blocks to have a recognisable url', () => {
      expect(isBlockValid(videoBlock(YT))).toBe(true);
      expect(isBlockValid(videoBlock('https://vimeo.com/1'))).toBe(false);
      expect(isBlockValid(videoBlock(''))).toBe(false);
    });

    it('filters out blocks the type cannot carry and invalid ones', () => {
      expect(
        filterBlocks('video', [
          textBlock('keep'),
          videoBlock(''),
          videoBlock(YT),
        ]),
      ).toEqual([videoBlock(YT)]);
    });

    it('keeps a text node blocks in order, dropping empty ones', () => {
      const files = [file('image', { id: 1 }), file('audio', { id: 2 })];

      expect(
        filterBlocks(
          'text',
          [
            textBlock('keep'),
            textBlock(''),
            imagesBlock([1]),
            imagesBlock([]),
            videoBlock(YT),
            audioBlock([2]),
            audioBlock([]),
          ],
          files,
        ),
      ).toEqual([
        textBlock('keep'),
        imagesBlock([1]),
        videoBlock(YT),
        audioBlock([2]),
      ]);
    });

    it('strips keys a block does not store', () => {
      expect(
        filterBlocks('text', [{ ...textBlock('x'), key: 'k' } as never]),
      ).toEqual([textBlock('x')]);
    });

    describe('file blocks', () => {
      const files = [
        file('image', { id: 1 }),
        file('image', { id: 2 }),
        file('audio', { id: 3 }),
      ];

      it('keeps only ids of attached files of the block type', () => {
        expect(filterBlocks('text', [imagesBlock([1, 3, 99])], files)).toEqual([
          imagesBlock([1]),
        ]);
        expect(filterBlocks('text', [audioBlock([1, 3])], files)).toEqual([
          audioBlock([3]),
        ]);
      });

      it('accepts whole files as clients send them back', () => {
        expect(
          filterBlocks(
            'text',
            [{ type: 'images', mode: 'grid', files: [{ id: 2 }] } as never],
            files,
          ),
        ).toEqual([imagesBlock([2])]);
      });

      it('drops repeats and caps a block at the file limit', () => {
        const many = Array.from({ length: 8 }, (_, i) =>
          file('image', { id: i + 1 }),
        );

        expect(
          filterBlocks('text', [imagesBlock([1, 1, 2, 3, 4, 5, 6, 7])], many),
        ).toEqual([imagesBlock([1, 2, 3, 4, 5])]);
      });

      it('keeps a known photo mode', () => {
        expect(
          filterBlocks(
            'text',
            [{ type: 'images', mode: 'slider', files: [1] }],
            files,
          ),
        ).toEqual([{ type: 'images', mode: 'slider', files: [1] }]);
      });

      it('falls back to the grid for an unknown photo mode', () => {
        expect(
          filterBlocks(
            'text',
            [{ type: 'images', mode: 'carousel', files: [1] } as never],
            files,
          ),
        ).toEqual([imagesBlock([1])]);
      });

      describe('overall limits of a text node', () => {
        const many = (type: string, count: number) =>
          Array.from({ length: count }, (_, i) => file(type, { id: i + 1 }));
        const ids = (from: number, count: number) =>
          Array.from({ length: count }, (_, i) => from + i);

        it('cuts photos past 30, dropping blocks left empty', () => {
          const blocks = Array.from({ length: 7 }, (_, i) =>
            imagesBlock(ids(i * 5 + 1, 5)),
          );

          const kept = filterBlocks('text', blocks, many('image', 35));

          expect(kept).toHaveLength(6);
          expect(
            kept.flatMap((it) => (it as { files: number[] }).files),
          ).toEqual(ids(1, 30));
        });

        it('cuts a block that crosses the photo limit', () => {
          const blocks = Array.from({ length: 6 }, (_, i) =>
            imagesBlock(ids(i * 5 + 1, i === 5 ? 3 : 5)),
          );
          blocks.push(imagesBlock([31, 32, 33]));

          const kept = filterBlocks('text', blocks, many('image', 33));

          expect(kept).toHaveLength(7);
          expect(kept[6]).toEqual(imagesBlock([31, 32]));
        });

        it('cuts songs past 15', () => {
          const blocks = Array.from({ length: 4 }, (_, i) =>
            audioBlock(ids(i * 5 + 1, 5)),
          );

          const kept = filterBlocks('text', blocks, many('audio', 20));

          expect(kept.map((it) => (it as { files: number[] }).files)).toEqual([
            ids(1, 5),
            ids(6, 5),
            ids(11, 5),
          ]);
        });

        it('drops videos past 6', () => {
          const blocks = Array.from({ length: 8 }, () => videoBlock(YT));

          expect(filterBlocks('text', blocks)).toHaveLength(6);
        });

        it('leaves a video node alone', () => {
          const blocks = Array.from({ length: 8 }, () => videoBlock(YT));

          expect(filterBlocks('video', blocks)).toHaveLength(8);
        });
      });

      it('drops a block whose files are all gone', () => {
        expect(filterBlocks('text', [imagesBlock([99])], files)).toEqual([]);
        expect(
          filterBlocks('text', [{ type: 'audio' } as never], files),
        ).toEqual([]);
      });
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

    it('gives video nodes no files', () => {
      expect(canHaveFile('video', file('image'))).toBe(false);
    });

    it('lets a text node carry photos and songs for its blocks', () => {
      expect(canHaveFile('text', file('image'))).toBe(true);
      expect(canHaveFile('text', file('audio'))).toBe(true);
    });

    it('filters a mixed list by node type', () => {
      const files = [file('image', { id: 1 }), file('audio', { id: 2 })];

      expect(filterFiles('image', files).map((f) => f.id)).toEqual([1]);
      expect(filterFiles('audio', files).map((f) => f.id)).toEqual([1, 2]);
    });
  });

  describe('keptFiles', () => {
    const files = [
      file('image', { id: 1 }),
      file('image', { id: 2 }),
      file('audio', { id: 3 }),
    ];

    it('keeps a text node files its blocks show, in block order', () => {
      expect(
        keptFiles('text', files, [audioBlock([3]), imagesBlock([1])]).map(
          (f) => f.id,
        ),
      ).toEqual([3, 1]);
    });

    it('releases every file of a text node without file blocks', () => {
      expect(keptFiles('text', files, [textBlock('x')])).toEqual([]);
    });

    it('leaves other node types alone', () => {
      expect(keptFiles('audio', files, [])).toBe(files);
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

    describe('text node', () => {
      const long = 'x'.repeat(64);

      it('accepts 64 characters of text', () => {
        expect(validateNodeContent('text', [], [textBlock(long)])).toBeNull();
      });

      it('counts the text of every text block together', () => {
        const half = 'x'.repeat(32);

        expect(
          validateNodeContent(
            'text',
            [],
            [textBlock(half), imagesBlock([1]), textBlock(half)],
          ),
        ).toBeNull();
      });

      it('rejects too little text, whatever else the post holds', () => {
        expect(
          validateNodeContent(
            'text',
            [],
            [textBlock('x'.repeat(63)), videoBlock(YT), imagesBlock([1])],
          ),
        ).toEqual(expect.any(String));
        expect(validateNodeContent('text', [], [imagesBlock([1])])).toEqual(
          expect.any(String),
        );
        expect(validateNodeContent('text', [], [])).toEqual(expect.any(String));
      });

      it('does not count the blanks around a block', () => {
        expect(
          validateNodeContent(
            'text',
            [],
            [textBlock(`  ${'x'.repeat(63)}\n `)],
          ),
        ).toEqual(expect.any(String));
      });
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
    it('joins every text block of a text node', () => {
      expect(
        deriveDescription(
          'text',
          [textBlock(' one '), imagesBlock([1]), textBlock('two')],
          '',
        ),
      ).toBe('one\n\ntwo');
    });

    it('keeps the current value when there is no text', () => {
      expect(deriveDescription('text', [imagesBlock([1])], 'kept')).toBe(
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

    it('uses the first photo for a text node', () => {
      const files = [
        file('audio', { id: 1 }),
        file('image', { id: 2, url: 'pic' }),
      ];

      expect(deriveThumbnail('text', files, [imagesBlock([2])], 'kept')).toBe(
        'pic',
      );
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

    it('takes a text node colour from its first photo', () => {
      const files = [
        file('image', { id: 1, metadata: { dominant_color: '#abcdef' } }),
      ];

      expect(deriveDominantColor('text', files, '#old')).toBe('#abcdef');
    });

    it('never touches video nodes', () => {
      const files = [
        file('image', { id: 1, metadata: { dominant_color: '#abcdef' } }),
      ];

      expect(deriveDominantColor('video', files, '#old')).toBe('#old');
    });
  });

  describe('resolveSettings', () => {
    const image = file('image');
    const audio = file('audio');
    const aura = { layout: 'aura' as const };

    it('keeps aura for a song node with a photo', () => {
      expect(resolveSettings('audio', [audio, image], aura, null)).toEqual(
        aura,
      );
    });

    it('drops aura for a song node without photos', () => {
      expect(resolveSettings('audio', [audio], aura, null)).toBeNull();
    });

    it('drops aura for other node types', () => {
      expect(resolveSettings('image', [image], aura, null)).toBeNull();
    });

    it('keeps the stored layout when the request leaves it out', () => {
      expect(resolveSettings('audio', [image], undefined, aura)).toEqual(aura);
      expect(resolveSettings('audio', [image], {}, aura)).toEqual(aura);
    });

    it('stores nothing for the default or an unknown layout', () => {
      expect(
        resolveSettings('audio', [image], { layout: 'post' }, aura),
      ).toBeNull();
      expect(
        resolveSettings('audio', [image], { layout: 'bogus' }, aura),
      ).toBeNull();
    });

    it('drops a stored aura once the photos are gone', () => {
      expect(resolveSettings('audio', [audio], undefined, aura)).toBeNull();
    });
  });
});
