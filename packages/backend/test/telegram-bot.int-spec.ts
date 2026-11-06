// Boots with the bot *off*, so no poll loop or delivery run starts against the
// real Bot API. Specs that need it on flip the flag after boot — config is read
// per call — with every transport call stubbed.
const TELEGRAM_TOKEN = '424242:spec-bot-token';
process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;
process.env.TELEGRAM_BOT_ENABLED = 'false';
process.env.TELEGRAM_PROXY_URL = '';
process.env.TELEGRAM_COOLDOWN_MINS = '5';
process.env.TELEGRAM_PURGE_AFTER_DAYS = '3';
process.env.TELEGRAM_MAX_MESSAGES = '3';
process.env.PUBLIC_URL = 'https://vault48.example';

import { createHash, createHmac } from 'crypto';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { NotificationsService } from '../src/modules/notifications/notifications.service';
import {
  TelegramBot,
  type TelegramUpdate,
} from '../src/modules/telegram/telegram.bot';
import { TelegramNotificationSender } from '../src/modules/telegram/telegram.sender';
import { TelegramTransport } from '../src/modules/telegram/telegram.transport';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

const SITE = 'https://vault48.example';

describe('telegram bot (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let bot: TelegramBot;
  let sender: TelegramNotificationSender;
  let transport: TelegramTransport;
  let call: jest.SpyInstance;

  let feedMark: number;
  let ledgerMark: number;

  const userIds: number[] = [];

  let nodeId: number;
  let nodeTitle: string;
  let commentId: number;
  let commentNodeId: number;

  /** Bodies of every `sendMessage` made since the stub was installed. */
  const sent = (): Array<{ chat_id: string | number; text: string }> =>
    call.mock.calls
      .filter(([method]) => method === 'sendMessage')
      .map(([, payload]) => payload);

  const sentTo = (chatId: string | number) =>
    sent().filter((m) => String(m.chat_id) === String(chatId));

  const makeUser = async (): Promise<number> => {
    const username = `tgspec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at, last_seen)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );

    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    const id = Number(row.id);
    userIds.push(id);

    return id;
  };

  const link = (userId: number, accountId: string) =>
    db.query(
      "INSERT INTO social (provider, account_id, account_name, account_photo, userId) VALUES ('telegram', ?, 'spec', '', ?)",
      [accountId, userId],
    );

  const setSettings = (
    userId: number,
    { enabled = true, sendTelegram = true, sendEmail = false } = {},
  ) =>
    db.query(
      `INSERT INTO notification_settings
         (userId, enabled, show_indicator, send_telegram, send_email,
          subscribed_to_flow, subscribed_to_boris, subscribed_to_comments)
       VALUES (?, ?, 1, ?, ?, 1, 1, 1)`,
      [userId, enabled ? 1 : 0, sendTelegram ? 1 : 0, sendEmail ? 1 : 0],
    );

  const readSettings = async (userId: number) => {
    const [row] = await db.query(
      'SELECT enabled, send_telegram, send_email FROM notification_settings WHERE userId = ? ORDER BY id ASC LIMIT 1',
      [userId],
    );

    return {
      enabled: Number(row.enabled),
      sendTelegram: Number(row.send_telegram),
      sendEmail: Number(row.send_email),
    };
  };

  /** A feed row for `userId`, created `minutesAgo` minutes ago. */
  const feedRow = async (
    userId: number,
    type: 'node' | 'comment' | 'boris',
    itemId: number,
    minutesAgo = 10,
  ): Promise<number> => {
    const result = await db.query(
      `INSERT INTO user_notifications (type, itemId, time, userId, created_at, updated_at)
       VALUES (?, ?, NOW() - INTERVAL ? MINUTE, ?, NOW() - INTERVAL ? MINUTE, NOW() - INTERVAL ? MINUTE)`,
      [type, itemId, minutesAgo, userId, minutesAgo, minutesAgo],
    );

    return Number(result.insertId);
  };

  const processed = async (notificationId: number): Promise<number> => {
    const [row] = await db.query(
      "SELECT COUNT(*) AS n FROM user_notifications_processed WHERE service = 'telegram' AND notification_id = ?",
      [notificationId],
    );

    return Number(row.n);
  };

  const message = (
    fromId: number,
    text: string,
    chatType = 'private',
  ): TelegramUpdate => ({
    update_id: 1,
    message: {
      text,
      chat: { id: fromId, type: chatType },
      from: { id: fromId },
    },
  });

  const signedTelegramPayload = (id: number) => {
    const payload: Record<string, string | number> = {
      id,
      first_name: 'Spec',
      username: `tg${id}`,
      auth_date: Math.floor(Date.now() / 1000),
    };

    const checkString = Object.keys(payload)
      .sort()
      .map((key) => `${key}=${String(payload[key])}`)
      .join('\n');

    return {
      ...payload,
      hash: createHmac(
        'sha256',
        createHash('sha256').update(TELEGRAM_TOKEN).digest(),
      )
        .update(checkString)
        .digest('hex'),
    };
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    bot = app.get(TelegramBot);
    sender = app.get(TelegramNotificationSender);
    transport = app.get(TelegramTransport);

    const [feed] = await db.query(
      'SELECT COALESCE(MAX(id), 0) AS id FROM user_notifications',
    );
    feedMark = Number(feed.id);
    const [ledger] = await db.query(
      'SELECT COALESCE(MAX(id), 0) AS id FROM user_notifications_processed',
    );
    ledgerMark = Number(ledger.id);

    const [node] = await db.query(
      `SELECT n.id, n.title FROM node n
       WHERE n.deleted_at IS NULL AND n.userId IS NOT NULL AND n.id <> 696
         AND n.title <> '' ORDER BY n.id DESC LIMIT 1`,
    );
    nodeId = Number(node.id);
    nodeTitle = node.title;

    const [comment] = await db.query(
      `SELECT c.id, c.nodeId FROM comment c JOIN node n ON n.id = c.nodeId
       WHERE c.deleted_at IS NULL AND n.deleted_at IS NULL AND c.text <> ''
         AND c.nodeId <> 696 ORDER BY c.id DESC LIMIT 1`,
    );
    commentId = Number(comment.id);
    commentNodeId = Number(comment.nodeId);
  });

  beforeEach(async () => {
    process.env.TELEGRAM_BOT_ENABLED = 'true';
    call = jest.spyOn(transport, 'call').mockResolvedValue({});

    // A run sends everything due, so rows left by an earlier test would leak in.
    await db.query('DELETE FROM user_notifications WHERE id > ?', [feedMark]);
  });

  afterEach(() => {
    process.env.TELEGRAM_BOT_ENABLED = 'false';
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await db.query('DELETE FROM user_notifications_processed WHERE id > ?', [
      ledgerMark,
    ]);
    await db.query('DELETE FROM user_notifications WHERE id > ?', [feedMark]);

    for (const id of userIds) {
      await db.query('DELETE FROM notification_settings WHERE userId = ?', [
        id,
      ]);
      await db.query('DELETE FROM social WHERE userId = ?', [id]);
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }

    await app.close();
  });

  describe('commands', () => {
    it('tells a stranger to link their account first', async () => {
      await bot.handleUpdate(message(900000001, '/start'));

      const [reply] = sentTo(900000001);
      expect(reply.text).toContain('Эй, я тебя не знаю!');
      expect(reply.text).toContain(
        `${SITE}/?sidebar=settings&amp;page=profile`,
      );
    });

    it('answers a stranger whatever they send', async () => {
      await bot.handleUpdate(message(900000002, 'hello'));

      expect(sentTo(900000002)).toHaveLength(1);
    });

    it('/start enables delivery, and turns mail off when notifications were off', async () => {
      const userId = await makeUser();
      await link(userId, '900000010');
      await setSettings(userId, {
        enabled: false,
        sendTelegram: false,
        sendEmail: true,
      });

      await bot.handleUpdate(message(900000010, '/start'));

      expect(await readSettings(userId)).toEqual({
        enabled: 1,
        sendTelegram: 1,
        sendEmail: 0,
      });
      expect(sentTo(900000010)[0].text).toContain('теперь я буду отправлять');
    });

    it('/start keeps mail on when notifications were already on', async () => {
      const userId = await makeUser();
      await link(userId, '900000011');
      await setSettings(userId, { sendTelegram: false, sendEmail: true });

      await bot.handleUpdate(message(900000011, '/start'));

      expect(await readSettings(userId)).toEqual({
        enabled: 1,
        sendTelegram: 1,
        sendEmail: 1,
      });
    });

    it('/start when already on changes nothing', async () => {
      const userId = await makeUser();
      await link(userId, '900000012');
      await setSettings(userId);

      await bot.handleUpdate(message(900000012, '/start'));

      expect(sentTo(900000012)[0].text).toBe(
        'Уже включены, не беспокойся ты так.',
      );
    });

    it('/start creates the settings row for a user who never had one', async () => {
      const userId = await makeUser();
      await link(userId, '900000013');

      await bot.handleUpdate(message(900000013, '/start'));

      expect(await readSettings(userId)).toMatchObject({
        enabled: 1,
        sendTelegram: 1,
      });
    });

    it('/stop turns Telegram off and leaves the rest', async () => {
      const userId = await makeUser();
      await link(userId, '900000020');
      await setSettings(userId, { sendEmail: true });

      await bot.handleUpdate(message(900000020, '/stop'));

      expect(await readSettings(userId)).toEqual({
        enabled: 1,
        sendTelegram: 0,
        sendEmail: 1,
      });
      expect(sentTo(900000020)[0].text).toContain('Прости, что надоедал');
    });

    it.each([
      ['notifications off', { enabled: false }],
      ['Telegram off', { sendTelegram: false }],
    ])('/stop with %s says it is already off', async (_label, settings) => {
      const accountId = String(900000030 + Math.floor(Math.random() * 1000));
      const userId = await makeUser();
      await link(userId, accountId);
      await setSettings(userId, settings);

      await bot.handleUpdate(message(Number(accountId), '/stop'));

      expect(sentTo(accountId)[0].text).toBe(
        'Всё итак выключено, спокойно, спокойно.',
      );
    });

    it('/help lists the commands', async () => {
      const userId = await makeUser();
      await link(userId, '900000040');

      await bot.handleUpdate(message(900000040, '/help@vault_bot'));

      const [reply] = sentTo(900000040);
      expect(reply.text).toContain('/start - включить отправку');
      expect(reply).toMatchObject({
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
    });

    it('ignores anything else from a linked user', async () => {
      const userId = await makeUser();
      await link(userId, '900000041');

      await bot.handleUpdate(message(900000041, 'how are you'));

      expect(sentTo(900000041)).toHaveLength(0);
    });

    it('ignores group chats, bots and updates without a message', async () => {
      await bot.handleUpdate(message(900000050, '/start', 'group'));
      await bot.handleUpdate({
        update_id: 2,
        message: { text: '/start', from: { id: 900000051, is_bot: true } },
      });
      await bot.handleUpdate({ update_id: 3 });

      expect(sent()).toHaveLength(0);
    });

    it('apologises when a command fails', async () => {
      const userId = await makeUser();
      await link(userId, '900000060');
      jest
        .spyOn(app.get(NotificationsService), 'getSettings')
        .mockRejectedValue(new Error('db down'));

      await bot.handleUpdate(message(900000060, '/start'));

      expect(sentTo(900000060)[0].text).toBe(
        'Что-то случилось, и я не могу удовлетворить твою просьбу.',
      );
    });

    it('survives a reply that cannot be delivered', async () => {
      call.mockRejectedValue(new Error('blocked by user'));

      await expect(
        bot.handleUpdate(message(900000061, '/start')),
      ).resolves.toBeUndefined();
    });
  });

  describe('greeting on link', () => {
    it('greets a newly linked account once, and not on re-link', async () => {
      const userId = await makeUser();
      await setSettings(userId);
      const payload = signedTelegramPayload(900000070);

      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(payload)
        .expect(200);

      expect(sentTo(900000070)).toHaveLength(1);
      expect(sentTo(900000070)[0].text).toContain('Бип-буп-боп');

      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(payload)
        .expect(200);

      expect(sentTo(900000070)).toHaveLength(1);
    });

    it('asks for /start when notifications are off', async () => {
      const userId = await makeUser();
      await setSettings(userId, { enabled: false });

      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(signedTelegramPayload(900000071))
        .expect(200);

      expect(sentTo(900000071)[0].text).toContain('просто набери /start');
    });

    it('links even when the greeting cannot be sent', async () => {
      call.mockRejectedValue(new Error('network down'));
      const userId = await makeUser();

      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(signedTelegramPayload(900000072))
        .expect(200);
    });

    it('stays silent while the bot is off', async () => {
      process.env.TELEGRAM_BOT_ENABLED = 'false';
      const userId = await makeUser();

      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(signedTelegramPayload(900000073))
        .expect(200);

      expect(call).not.toHaveBeenCalled();
    });
  });

  describe('notification delivery', () => {
    it('sends a node and a comment, oldest first, and records both', async () => {
      const userId = await makeUser();
      await link(userId, '900000100');
      await setSettings(userId);

      const older = await feedRow(userId, 'node', nodeId, 20);
      const newer = await feedRow(userId, 'comment', commentId, 10);

      await sender.runOnce();

      const messages = sentTo(900000100);
      expect(messages).toHaveLength(2);
      expect(messages[0].text).toContain(`${SITE}/post${nodeId}`);
      expect(messages[0]).toMatchObject({
        link_preview_options: { is_disabled: false },
      });
      expect(messages[1].text).toContain(
        `${SITE}/post${commentNodeId}#comment-${commentId}`,
      );
      expect(await processed(older)).toBe(1);
      expect(await processed(newer)).toBe(1);
    });

    it('escapes the node title', async () => {
      const userId = await makeUser();
      await link(userId, '900000101');
      await setSettings(userId);
      await feedRow(userId, 'node', nodeId);

      await sender.runOnce();

      expect(sentTo(900000101)[0].text).toContain(
        nodeTitle
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;'),
      );
    });

    it('sends only the newest few per recipient', async () => {
      const userId = await makeUser();
      await link(userId, '900000110');
      await setSettings(userId);

      const rows: number[] = [];
      for (let minutes = 50; minutes >= 10; minutes -= 10) {
        rows.push(await feedRow(userId, 'node', nodeId, minutes));
      }

      await sender.runOnce();

      expect(sentTo(900000110)).toHaveLength(3);

      // Everything taken is recorded, sent or not, so the rest never trickle out.
      for (const id of rows) {
        expect(await processed(id)).toBe(1);
      }
    });

    it.each([
      ['notifications off', { enabled: false }],
      ['Telegram off', { sendTelegram: false }],
    ])('skips a recipient with %s but still records the row', async (_l, s) => {
      const accountId = String(900000120 + Math.floor(Math.random() * 1000));
      const userId = await makeUser();
      await link(userId, accountId);
      await setSettings(userId, s);
      const row = await feedRow(userId, 'node', nodeId);

      await sender.runOnce();

      expect(sentTo(accountId)).toHaveLength(0);
      expect(await processed(row)).toBe(1);
    });

    it('skips a recipient with no linked account', async () => {
      const userId = await makeUser();
      await setSettings(userId);
      const row = await feedRow(userId, 'node', nodeId);

      await sender.runOnce();

      expect(sent()).toHaveLength(0);
      expect(await processed(row)).toBe(1);
    });

    it('leaves rows inside the cooldown and past the purge horizon alone', async () => {
      const userId = await makeUser();
      await link(userId, '900000130');
      await setSettings(userId);

      const fresh = await feedRow(userId, 'node', nodeId, 1);
      const stale = await feedRow(userId, 'node', nodeId, 4 * 24 * 60);

      await sender.runOnce();

      expect(sentTo(900000130)).toHaveLength(0);
      expect(await processed(fresh)).toBe(0);
      expect(await processed(stale)).toBe(0);
    });

    it('never sends a row twice', async () => {
      const userId = await makeUser();
      await link(userId, '900000140');
      await setSettings(userId);
      await feedRow(userId, 'node', nodeId);

      await sender.runOnce();
      await sender.runOnce();

      expect(sentTo(900000140)).toHaveLength(1);
    });

    it('drops rows whose subject is gone', async () => {
      const userId = await makeUser();
      await link(userId, '900000150');
      await setSettings(userId);
      const row = await feedRow(userId, 'comment', 2_000_000_000);

      await sender.runOnce();

      expect(sentTo(900000150)).toHaveLength(0);
      expect(await processed(row)).toBe(1);
    });

    it('records rows even when the send fails, and keeps going', async () => {
      const failing = await makeUser();
      await link(failing, '900000160');
      await setSettings(failing);
      const failedRow = await feedRow(failing, 'node', nodeId, 20);

      const working = await makeUser();
      await link(working, '900000161');
      await setSettings(working);
      await feedRow(working, 'node', nodeId, 10);

      call.mockImplementation(async (_method, payload) => {
        if (String(payload?.chat_id) === '900000160') {
          throw new Error('bot was blocked by the user');
        }

        return {};
      });

      await sender.runOnce();

      expect(sentTo(900000161)).toHaveLength(1);
      expect(await processed(failedRow)).toBe(1);
    });

    it('does nothing when nothing is due', async () => {
      await sender.runOnce();

      expect(call).not.toHaveBeenCalled();
    });
  });

  describe('polling', () => {
    it('answers polled updates and stops promptly on shutdown', async () => {
      let polls = 0;

      call.mockImplementation(
        (
          method: string,
          payload: Record<string, unknown>,
          signal?: AbortSignal,
        ) => {
          if (method === 'getMe') {
            return Promise.resolve({ username: 'vault_spec_bot' });
          }

          if (method === 'getUpdates') {
            polls += 1;

            if (polls === 1) {
              return Promise.resolve([message(900000200, '/help')]);
            }

            expect(payload.offset).toBe(2);

            // Hold the poll open like Telegram does, until shutdown aborts it.
            return new Promise((_resolve, reject) => {
              signal?.addEventListener('abort', () =>
                reject(new Error('aborted')),
              );
            });
          }

          return Promise.resolve({});
        },
      );

      bot.onApplicationBootstrap();

      await waitFor(() => polls >= 2);
      expect(sentTo(900000200)).toHaveLength(1);

      await bot.onModuleDestroy();
    });

    it('retries after a failed poll', async () => {
      jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

      let polls = 0;
      call.mockImplementation(
        (method: string, _payload: unknown, signal?: AbortSignal) => {
          if (method !== 'getUpdates') {
            return Promise.resolve({});
          }

          polls += 1;

          if (polls === 1) {
            return Promise.reject(new Error('ECONNRESET'));
          }

          return new Promise((_resolve, reject) => {
            signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            );
          });
        },
      );

      try {
        bot.onApplicationBootstrap();
        await waitFor(() => polls === 1);
        await jest.advanceTimersByTimeAsync(5_000);
        await waitFor(() => polls === 2);
      } finally {
        await bot.onModuleDestroy();
        jest.useRealTimers();
      }
    });

    it('does not poll while disabled', async () => {
      process.env.TELEGRAM_BOT_ENABLED = 'false';

      bot.onApplicationBootstrap();
      await bot.onModuleDestroy();

      expect(call).not.toHaveBeenCalled();
    });
  });
});

/** Yields to the event loop until `predicate` holds. */
const waitFor = async (predicate: () => boolean): Promise<void> => {
  for (let i = 0; i < 200; i += 1) {
    if (predicate()) {
      return;
    }

    await new Promise((resolve) => setImmediate(resolve));
  }

  throw new Error('condition never held');
};
