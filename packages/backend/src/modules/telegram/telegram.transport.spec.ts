import { getTelegramConfig } from '../../config/env';

import { telegramMethodUrl } from './telegram.transport';

describe('telegram transport', () => {
  describe('telegramMethodUrl', () => {
    it('builds the bot method url', () => {
      expect(telegramMethodUrl('123:ABC', 'sendMessage')).toBe(
        'https://api.telegram.org/bot123:ABC/sendMessage',
      );
    });
  });

  describe('getTelegramConfig', () => {
    const original = { ...process.env };

    afterEach(() => {
      process.env = { ...original };
    });

    it('falls back to the documented defaults', () => {
      delete process.env.TELEGRAM_COOLDOWN_MINS;
      delete process.env.TELEGRAM_PURGE_AFTER_DAYS;
      delete process.env.TELEGRAM_MAX_MESSAGES;
      delete process.env.TELEGRAM_PROXY_URL;

      expect(getTelegramConfig()).toMatchObject({
        proxyUrl: '',
        cooldownMins: 5,
        purgeAfterDays: 3,
        maxMessages: 3,
      });
    });

    it('reads the numeric settings', () => {
      process.env.TELEGRAM_COOLDOWN_MINS = '15';
      process.env.TELEGRAM_PURGE_AFTER_DAYS = '30';
      process.env.TELEGRAM_MAX_MESSAGES = '1';

      expect(getTelegramConfig()).toMatchObject({
        cooldownMins: 15,
        purgeAfterDays: 30,
        maxMessages: 1,
      });
    });

    /** A zero cooldown would busy-loop the sender, so it falls back. */
    it('ignores non-positive and unparseable values', () => {
      for (const value of ['0', '-1', 'soon', '']) {
        process.env.TELEGRAM_COOLDOWN_MINS = value;
        expect(getTelegramConfig().cooldownMins).toBe(5);
      }
    });

    it('carries the proxy url through untouched', () => {
      process.env.TELEGRAM_PROXY_URL = 'socks5://127.0.0.1:9050';

      expect(getTelegramConfig().proxyUrl).toBe('socks5://127.0.0.1:9050');
    });
  });
});
