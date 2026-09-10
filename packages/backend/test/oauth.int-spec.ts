import { createHash, createHmac } from 'crypto';

// A fake bot token, so the Telegram signature path can be exercised without a
// real bot. Must be set before the config module reads the environment.
const TELEGRAM_TOKEN = '424242:spec-bot-token';
process.env.TELEGRAM_TOKEN = TELEGRAM_TOKEN;

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { getJwtSecret } from '../src/config/env';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

interface Profile {
  provider?: string;
  id?: string;
  email?: string;
  name?: string;
  photo?: string;
}

describe('oauth (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let userId: number;
  let otherId: number;

  const userIds: number[] = [];

  /** A claim token exactly as `/process` would mint one. */
  const claimToken = (profile: Profile = {}): string =>
    jwt.sign(
      {
        typ: 'oauth_claim',
        provider: 'vkontakte',
        id: '900001',
        email: '',
        name: 'VK Person',
        photo: '',
        ...profile,
      },
      getJwtSecret(),
      { algorithm: 'HS256' },
    );

  const telegramPayload = (overrides: Record<string, unknown> = {}) => {
    const payload: Record<string, unknown> = {
      id: 770001,
      first_name: 'Спек',
      last_name: 'Ботов',
      username: 'spec_bot_user',
      photo_url: 'https://t.me/i/userpic/320/spec.jpg',
      auth_date: 1767225600,
      ...overrides,
    };

    const checkString = [
      'auth_date',
      'first_name',
      'id',
      'last_name',
      'photo_url',
      'username',
    ]
      .filter((key) => payload[key] !== undefined && payload[key] !== '')
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

  const makeUser = async (email?: string): Promise<number> => {
    const username = `oauthspec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at, last_seen)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), email ?? `${username}@example.com`],
    );

    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    const id = Number(row.id);
    userIds.push(id);

    return id;
  };

  const clearSocials = () =>
    db.query('DELETE FROM social WHERE account_id LIKE ?', ['9000%']);

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    userId = await makeUser();
    otherId = await makeUser();
  });

  afterAll(async () => {
    await clearSocials();

    for (const id of userIds) {
      await db.query('DELETE FROM social WHERE userId = ?', [id]);
      await db.query('DELETE FROM notification_settings WHERE userId = ?', [
        id,
      ]);
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }

    await db.query('DELETE FROM social WHERE account_id = ?', ['770001']);
    await app.close();
  });

  beforeEach(clearSocials);

  describe('GET /oauth', () => {
    it('401s without a token', async () => {
      await http().get('/api/oauth/').expect(401);
    });

    it('returns an empty list for a user with no accounts', async () => {
      const { body } = await http()
        .get('/api/oauth/')
        .set(authHeader(userId))
        .expect(200);

      expect(body).toEqual({ accounts: [] });
    });

    it('returns only the caller’s accounts, in the wire shape', async () => {
      await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900001', name: 'Mine' }) })
        .expect(200);

      await http()
        .post('/api/oauth/')
        .set(authHeader(otherId))
        .send({ token: claimToken({ id: '900002', name: 'Theirs' }) })
        .expect(200);

      const { body } = await http()
        .get('/api/oauth/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.accounts).toEqual([
        { provider: 'vkontakte', id: '900001', name: 'Mine', photo: '' },
      ]);
    });
  });

  describe('POST /oauth (attach)', () => {
    it('links the account and answers 200', async () => {
      const { body } = await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({
          token: claimToken({
            id: '900010',
            name: 'Linked',
            photo: 'https://example.com/p.jpg',
          }),
        })
        .expect(200);

      expect(body).toEqual({
        account: {
          provider: 'vkontakte',
          id: '900010',
          name: 'Linked',
          photo: 'https://example.com/p.jpg',
        },
      });

      const [row] = await db.query(
        'SELECT provider, account_id, userId FROM social WHERE account_id = ?',
        ['900010'],
      );
      expect(Number(row.userId)).toBe(userId);
    });

    it('400s an unparseable or unsigned token', async () => {
      for (const token of ['', 'nonsense', jwt.sign({ typ: 'x' }, 'wrong')]) {
        const { body } = await http()
          .post('/api/oauth/')
          .set(authHeader(userId))
          .send({ token })
          .expect(400);

        expect(body.error).toBe('OAuth_Invalid_Data');
      }
    });

    /** An API token is not a claim, and must not be accepted as one. */
    it('400s an ordinary api token', async () => {
      const apiToken = jwt.sign(
        { uid: userId, nme: 'x', rol: 'user' },
        getJwtSecret(),
      );

      await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: apiToken })
        .expect(400);
    });

    /** Re-attaching your own account refreshes it rather than failing. */
    it('is idempotent for the same user and refreshes name and photo', async () => {
      const attach = (name: string) =>
        http()
          .post('/api/oauth/')
          .set(authHeader(userId))
          .send({ token: claimToken({ id: '900011', name }) })
          .expect(200);

      await attach('Old Name');
      const { body } = await attach('New Name');

      expect(body.account.name).toBe('New Name');

      const rows = await db.query(
        'SELECT id FROM social WHERE account_id = ?',
        ['900011'],
      );
      expect(rows).toHaveLength(1);
    });

    it('409s when the account belongs to somebody else', async () => {
      await http()
        .post('/api/oauth/')
        .set(authHeader(otherId))
        .send({ token: claimToken({ id: '900012' }) })
        .expect(200);

      const { body } = await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900012' }) })
        .expect(409);

      expect(body.error).toBe('OAuth_Conflict');
    });

    it('409s when the provider email belongs to another account', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [
        otherId,
      ]);

      const { body } = await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900013', email: row.email }) })
        .expect(409);

      expect(body.error).toBe('OAuth_Conflict');
    });

    it('allows attaching when the email is the caller’s own', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [
        userId,
      ]);

      await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900014', email: row.email }) })
        .expect(200);
    });

    it('401s without a token', async () => {
      await http()
        .post('/api/oauth/')
        .send({ token: claimToken() })
        .expect(401);
    });
  });

  describe('PUT /oauth (login or register)', () => {
    it('logs in when the account is already linked', async () => {
      await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900020' }) })
        .expect(200);

      const { body } = await http()
        .put('/api/oauth/')
        .send({ token: claimToken({ id: '900020' }) })
        .expect(200);

      expect(Object.keys(body)).toEqual(['token']);

      // The token is for the linked user, and carries the frozen claim set.
      const decoded = jwt.verify(body.token, getJwtSecret()) as Record<
        string,
        unknown
      >;
      expect(decoded.uid).toBe(userId);
      expect(decoded.exp).toBeUndefined();
    });

    /**
     * The first call carries only the claim. 428 is what tells the frontend to
     * show the signup form.
     */
    it('428s with per-field errors when registration details are missing', async () => {
      const { body } = await http()
        .put('/api/oauth/')
        .send({ token: claimToken({ id: '900021' }) })
        .expect(428);

      expect(body.errors).toEqual({
        username: expect.any(String),
        password: expect.any(String),
      });
    });

    it('428s an invalid username or short password', async () => {
      const { body } = await http()
        .put('/api/oauth/')
        .send({
          token: claimToken({ id: '900021' }),
          username: 'no',
          password: '123',
        })
        .expect(428);

      expect(Object.keys(body.errors).sort()).toEqual(['password', 'username']);
    });

    it('registers, links the account and returns a usable token', async () => {
      const username = `oauthreg_${Date.now()}`;

      const { body } = await http()
        .put('/api/oauth/')
        .send({
          token: claimToken({
            id: '900022',
            name: 'Registered Person',
            email: `${username}@example.com`,
          }),
          username,
          password: 'hunter22',
        })
        .expect(200);

      const [row] = await db.query('SELECT * FROM user WHERE username = ?', [
        username,
      ]);
      userIds.push(Number(row.id));

      expect(row.email).toBe(`${username}@example.com`);
      expect(row.fullname).toBe('Registered Person');
      expect(Number(row.is_activated)).toBe(1);
      // Stored hashed, never in the clear.
      expect(row.password).not.toBe('hunter22');
      expect(row.password.startsWith('$2')).toBe(true);

      const [social] = await db.query(
        'SELECT userId FROM social WHERE account_id = ?',
        ['900022'],
      );
      expect(Number(social.userId)).toBe(Number(row.id));

      // The returned token authenticates the new user.
      const me = await http()
        .get('/api/auth/')
        .set('Authorization', `Bearer ${body.token}`)
        .expect(200);
      expect(me.body.user.username).toBe(username);
    });

    it('428s a username that is already taken', async () => {
      const [row] = await db.query('SELECT username FROM user WHERE id = ?', [
        userId,
      ]);

      const { body } = await http()
        .put('/api/oauth/')
        .send({
          token: claimToken({ id: '900023' }),
          username: row.username,
          password: 'hunter22',
        })
        .expect(428);

      expect(body.errors).toEqual({ username: expect.any(String) });
    });

    /** Same email means the accounts should be merged by logging in. */
    it('409s when the provider email is already registered', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [
        otherId,
      ]);

      const { body } = await http()
        .put('/api/oauth/')
        .send({
          token: claimToken({ id: '900024', email: row.email }),
          username: `whoever_${Date.now()}`,
          password: 'hunter22',
        })
        .expect(409);

      expect(body.error).toBe('OAuth_Conflict');
    });

    it('400s without a valid claim', async () => {
      await http().put('/api/oauth/').send({}).expect(400);
      await http().put('/api/oauth/').send({ token: 'nope' }).expect(400);
    });
  });

  describe('DELETE /oauth/:provider/:id', () => {
    it('unlinks the caller’s account', async () => {
      await http()
        .post('/api/oauth/')
        .set(authHeader(userId))
        .send({ token: claimToken({ id: '900030' }) })
        .expect(200);

      await http()
        .delete('/api/oauth/vkontakte/900030')
        .set(authHeader(userId))
        .expect(200);

      const rows = await db.query(
        'SELECT id FROM social WHERE account_id = ?',
        ['900030'],
      );
      expect(rows).toEqual([]);
    });

    /** Deleting is scoped to the caller, so it cannot unlink someone else's. */
    it('leaves another user’s account alone', async () => {
      await http()
        .post('/api/oauth/')
        .set(authHeader(otherId))
        .send({ token: claimToken({ id: '900031' }) })
        .expect(200);

      await http()
        .delete('/api/oauth/vkontakte/900031')
        .set(authHeader(userId))
        .expect(200);

      const rows = await db.query(
        'SELECT id FROM social WHERE account_id = ?',
        ['900031'],
      );
      expect(rows).toHaveLength(1);
    });

    it('401s without a token', async () => {
      await http().delete('/api/oauth/vkontakte/900030').expect(401);
    });
  });

  describe('POST /oauth/telegram/attach', () => {
    const attach = (uid: number, payload: Record<string, unknown>) =>
      http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(uid))
        .send(payload);

    beforeEach(async () => {
      await db.query('DELETE FROM social WHERE account_id = ?', ['770001']);
    });

    it('links the account when the signature checks out', async () => {
      const { body } = await attach(userId, telegramPayload()).expect(200);

      expect(body.account).toEqual({
        provider: 'telegram',
        id: '770001',
        name: 'Спек Ботов (spec_bot_user)',
        photo: 'https://t.me/i/userpic/320/spec.jpg',
      });
    });

    /** Linking Telegram opts the user into Telegram delivery. */
    it('turns on telegram notification delivery', async () => {
      await attach(userId, telegramPayload()).expect(200);

      const [row] = await db.query(
        'SELECT send_telegram FROM notification_settings WHERE userId = ?',
        [userId],
      );
      expect(Number(row.send_telegram)).toBe(1);
    });

    it('400s a tampered payload', async () => {
      const payload = telegramPayload();

      const { body } = await attach(userId, {
        ...payload,
        username: 'someone_else',
      }).expect(400);

      expect(body.error).toBe('OAuth_Invalid_Data');
    });

    it('400s a payload with no hash', async () => {
      const { hash: _dropped, ...unsigned } = telegramPayload();

      await attach(userId, unsigned).expect(400);
    });

    /** Re-attaching your own Telegram account must succeed, not conflict. */
    it('is idempotent for the same user', async () => {
      await attach(userId, telegramPayload()).expect(200);
      await attach(userId, telegramPayload()).expect(200);

      const rows = await db.query(
        'SELECT id FROM social WHERE account_id = ?',
        ['770001'],
      );
      expect(rows).toHaveLength(1);
    });

    it('409s when another user already has it', async () => {
      await attach(otherId, telegramPayload()).expect(200);

      const { body } = await attach(userId, telegramPayload()).expect(409);

      expect(body.error).toBe('OAuth_Conflict');
    });

    it('401s without a token', async () => {
      await http()
        .post('/api/oauth/telegram/attach')
        .send(telegramPayload())
        .expect(401);
    });
  });

  describe('DELETE /oauth/telegram/:id', () => {
    it('unlinks and turns off telegram delivery', async () => {
      await http()
        .post('/api/oauth/telegram/attach')
        .set(authHeader(userId))
        .send(telegramPayload())
        .expect(200);

      await http()
        .delete('/api/oauth/telegram/770001')
        .set(authHeader(userId))
        .expect(200);

      const rows = await db.query(
        'SELECT id FROM social WHERE account_id = ?',
        ['770001'],
      );
      expect(rows).toEqual([]);

      const [settings] = await db.query(
        'SELECT send_telegram FROM notification_settings WHERE userId = ?',
        [userId],
      );
      expect(Number(settings.send_telegram)).toBe(0);
    });

    it('401s without a token', async () => {
      await http().delete('/api/oauth/telegram/770001').expect(401);
    });
  });
});
