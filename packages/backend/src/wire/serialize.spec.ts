import type { File } from '../entities/file.entity';
import type { User } from '../entities/user.entity';

import {
  GO_ZERO_TIME,
  sortFilesByOrder,
  toWireBlocks,
  toWireDate,
  toWireDateOrNull,
  toWireFlow,
  toWireShallowFile,
  toWireShallowUser,
  toWireString,
} from './serialize';

/**
 * These conventions are a frozen client contract, and none of them are what
 * TypeScript would produce by default.
 */
describe('wire serialisation', () => {
  describe('toWireDate', () => {
    it('emits RFC3339 UTC with no fractional seconds', () => {
      expect(toWireDate(new Date('2021-05-05T12:34:56.000Z'))).toBe(
        '2021-05-05T12:34:56Z',
      );
    });

    it('never leaks milliseconds even when the value carries them', () => {
      expect(toWireDate(new Date('2021-05-05T12:34:56.789Z'))).not.toContain('.');
    });

    it('maps null and undefined to the zero date, not null', () => {
      expect(toWireDate(null)).toBe(GO_ZERO_TIME);
      expect(toWireDate(undefined)).toBe(GO_ZERO_TIME);
    });

    it('maps an unparseable value to the zero date rather than Invalid Date', () => {
      expect(toWireDate('not a date')).toBe(GO_ZERO_TIME);
    });

    it('accepts a string', () => {
      expect(toWireDate('2021-05-05T12:34:56Z')).toBe('2021-05-05T12:34:56Z');
    });
  });

  describe('toWireDateOrNull', () => {
    it('keeps null null, for the genuinely nullable fields', () => {
      expect(toWireDateOrNull(null)).toBeNull();
      expect(toWireDateOrNull(undefined)).toBeNull();
    });

    it('formats a present value like toWireDate', () => {
      expect(toWireDateOrNull(new Date('2021-05-05T12:34:56.000Z'))).toBe(
        '2021-05-05T12:34:56Z',
      );
    });
  });

  describe('toWireString', () => {
    it('maps null and undefined to an empty string', () => {
      expect(toWireString(null)).toBe('');
      expect(toWireString(undefined)).toBe('');
    });

    it('preserves an empty string and does not trim', () => {
      expect(toWireString('')).toBe('');
      expect(toWireString('  x  ')).toBe('  x  ');
    });
  });

  describe('toWireFlow', () => {
    it('always emits all three keys', () => {
      expect(toWireFlow(null)).toEqual({
        display: '',
        show_description: false,
        dominant_color: '',
      });
    });

    it('preserves an empty display rather than defaulting it to a variant', () => {
      expect(toWireFlow({ display: '', show_description: true }).display).toBe('');
    });

    it('passes a known variant through', () => {
      expect(
        toWireFlow({
          display: 'quadro',
          show_description: true,
          dominant_color: '#abc',
        }),
      ).toEqual({
        display: 'quadro',
        show_description: true,
        dominant_color: '#abc',
      });
    });
  });

  describe('toWireBlocks', () => {
    it('gives every block all three keys regardless of type', () => {
      expect(
        toWireBlocks([
          { type: 'text', text: 'hello' },
          { type: 'video', url: 'https://y' },
        ]),
      ).toEqual([
        { type: 'text', text: 'hello', url: '' },
        { type: 'video', text: '', url: 'https://y' },
      ]);
    });

    it('maps a null blob to an empty array', () => {
      expect(toWireBlocks(null)).toEqual([]);
    });
  });

  describe('toWireShallowUser', () => {
    it('serialises a missing user as the zero object, not null', () => {
      expect(toWireShallowUser(null)).toEqual({ id: 0, username: '', photo: '' });
    });

    it('exposes photo as the url string, not an object', () => {
      const user = {
        id: 7,
        username: 'someone',
        photo: { url: 'https://p' } as File,
      };

      expect(toWireShallowUser(user)).toEqual({
        id: 7,
        username: 'someone',
        photo: 'https://p',
      });
    });
  });

  describe('toWireShallowFile', () => {
    it('returns null for a missing file', () => {
      expect(toWireShallowFile(null)).toBeNull();
    });

    it('omits paths and timestamps', () => {
      const file = {
        id: 3,
        url: 'u',
        metadata: { width: 1 },
        type: 'image',
        mime: 'image/png',
        size: 5,
        path: 'secret',
        fullPath: 'secret',
        createdAt: new Date(),
      } as unknown as File;

      expect(Object.keys(toWireShallowFile(file) ?? {}).sort()).toEqual([
        'id',
        'metadata',
        'mime',
        'size',
        'type',
        'url',
      ]);
    });
  });

  describe('sortFilesByOrder', () => {
    const files = [{ id: 1 }, { id: 2 }, { id: 3 }] as File[];

    it('reorders to match the id list', () => {
      expect(sortFilesByOrder(files, [3, 1, 2]).map(f => f.id)).toEqual([3, 1, 2]);
    });

    it('drops ids with no surviving row instead of leaving holes', () => {
      expect(sortFilesByOrder(files, [3, 99, 1]).map(f => f.id)).toEqual([3, 1]);
    });

    it('returns the input untouched when there is no order', () => {
      expect(sortFilesByOrder(files, [])).toBe(files);
    });
  });
});
