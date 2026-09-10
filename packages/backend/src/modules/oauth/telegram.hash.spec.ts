import { createHash, createHmac } from 'crypto';

import {
  buildCheckString,
  isTelegramHashValid,
  telegramAccountName,
  type TelegramAuthPayload,
} from './telegram.hash';

const TOKEN = '123456:test-bot-token';

/** Signs a payload the way the Telegram login widget does. */
const sign = (payload: TelegramAuthPayload): string =>
  createHmac('sha256', createHash('sha256').update(TOKEN).digest())
    .update(buildCheckString(payload))
    .digest('hex');

const signed = (payload: TelegramAuthPayload): TelegramAuthPayload => ({
  ...payload,
  hash: sign(payload),
});

const BASE: TelegramAuthPayload = {
  id: 42,
  first_name: 'Фёдор',
  last_name: 'Катуров',
  username: 'muerwre',
  photo_url: 'https://t.me/i/userpic/320/muerwre.jpg',
  auth_date: 1767225600,
};

describe('telegram login payload', () => {
  describe('buildCheckString', () => {
    it('sorts fields by key, one per line', () => {
      expect(buildCheckString(BASE).split('\n')).toEqual([
        'auth_date=1767225600',
        'first_name=Фёдор',
        'id=42',
        'last_name=Катуров',
        'photo_url=https://t.me/i/userpic/320/muerwre.jpg',
        'username=muerwre',
      ]);
    });

    /** The widget omits fields it has no value for, so the hash must too. */
    it('omits absent and empty fields', () => {
      expect(
        buildCheckString({
          id: 1,
          auth_date: 2,
          last_name: '',
          username: undefined,
        }),
      ).toBe('auth_date=2\nid=1');
    });

    it('ignores fields outside the signed set', () => {
      expect(buildCheckString({ ...BASE, hash: 'deadbeef' })).toBe(
        buildCheckString(BASE),
      );
    });
  });

  describe('isTelegramHashValid', () => {
    it('accepts a correctly signed payload', () => {
      expect(isTelegramHashValid(signed(BASE), TOKEN)).toBe(true);
    });

    it('accepts a minimal payload', () => {
      const minimal = { id: 7, auth_date: 1767225600 };

      expect(isTelegramHashValid(signed(minimal), TOKEN)).toBe(true);
    });

    it('rejects a tampered field', () => {
      const payload = signed(BASE);

      expect(isTelegramHashValid({ ...payload, id: 43 }, TOKEN)).toBe(false);
      expect(
        isTelegramHashValid({ ...payload, username: 'someone-else' }, TOKEN),
      ).toBe(false);
    });

    it('rejects a payload signed with another bot token', () => {
      expect(isTelegramHashValid(signed(BASE), 'other-token')).toBe(false);
    });

    it('rejects a missing or malformed hash', () => {
      expect(isTelegramHashValid(BASE, TOKEN)).toBe(false);
      expect(isTelegramHashValid({ ...BASE, hash: '' }, TOKEN)).toBe(false);
      expect(isTelegramHashValid({ ...BASE, hash: 'short' }, TOKEN)).toBe(
        false,
      );
    });

    /** Without a token nothing can be verified, so nothing is accepted. */
    it('rejects everything when no bot token is configured', () => {
      expect(isTelegramHashValid(signed(BASE), '')).toBe(false);
    });
  });

  describe('telegramAccountName', () => {
    it('combines the full name with the handle', () => {
      expect(telegramAccountName(BASE)).toBe('Фёдор Катуров (muerwre)');
    });

    it('uses the first name alone when there is no surname', () => {
      expect(
        telegramAccountName({ first_name: 'Фёдор', username: 'muerwre' }),
      ).toBe('Фёдор (muerwre)');
    });

    it('omits the brackets without a handle', () => {
      expect(telegramAccountName({ first_name: 'Фёдор' })).toBe('Фёдор');
    });

    it('falls back to the handle when there is no name', () => {
      expect(telegramAccountName({ username: 'muerwre' })).toBe('muerwre');
    });

    it('yields an empty name when there is nothing to use', () => {
      expect(telegramAccountName({ id: 1 })).toBe('');
    });
  });
});
