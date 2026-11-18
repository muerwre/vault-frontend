import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { MailService } from '../src/modules/mail/mail.service';
import { RateLimiter } from '../src/modules/registration/rate-limiter';
import { RegistrationService } from '../src/modules/registration/registration.service';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

describe('registration (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;
  let mail: MailService;
  let registration: RegistrationService;

  const stamp = Date.now().toString(36);
  const userIds: number[] = [];
  let seq = 0;

  let mailUp: jest.SpyInstance;
  let sendLink: jest.SpyInstance;
  let sendApproval: jest.SpyInstance;

  const newEmail = () => `regspec_${stamp}_${(seq += 1)}@example.com`;
  const newName = () => `regspec_${stamp}_${(seq += 1)}`;

  const rowOf = async (email: string) =>
    (
      await db.query('SELECT * FROM registration_request WHERE email = ?', [
        email,
      ])
    )[0];

  /** The code from the last mailed link. */
  const lastCode = (): string =>
    sendLink.mock.calls[sendLink.mock.calls.length - 1][1];

  const makeUser = async (
    role: 'user' | 'admin',
    options: { email?: string | null; deleted?: boolean } = {},
  ) => {
    const username = newName();
    const result = await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW(), ?)`,
      [
        username,
        await bcrypt.hash('x', 4),
        options.email === undefined ? `${username}@example.com` : options.email,
        role,
        options.deleted ? new Date() : null,
      ],
    );
    userIds.push(Number(result.insertId));

    return { id: Number(result.insertId), username };
  };

  const setFlags = (enabled: boolean, approval = false) => {
    process.env.REGISTRATION_ENABLED = String(enabled);
    process.env.REGISTRATION_APPROVAL = String(approval);
  };

  const register = (email: string, reason?: string) =>
    http().post('/api/auth/register').send({ email, reason });

  let admin: { id: number };
  let member: { id: number };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());
    mail = app.get(MailService);
    registration = app.get(RegistrationService);

    admin = await makeUser('admin');
    member = await makeUser('user');
  });

  beforeEach(() => {
    setFlags(true);
    mailUp = jest.spyOn(mail, 'isAvailable', 'get').mockReturnValue(true);
    sendLink = jest
      .spyOn(mail, 'sendRegistrationLink')
      .mockResolvedValue({ sent: true });
    sendApproval = jest
      .spyOn(mail, 'sendApprovalRequest')
      .mockResolvedValue(undefined);

    // Every spec request comes from one address.
    Object.assign(registration, {
      perIp: new RateLimiter(1000, 60 * 60 * 1000),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    delete process.env.REGISTRATION_ENABLED;
    delete process.env.REGISTRATION_APPROVAL;

    await db.query('DELETE FROM registration_request WHERE email LIKE ?', [
      `regspec_${stamp}_%`,
    ]);
    await db.query('DELETE FROM restore_code WHERE userId IN (?)', [userIds]);
    await db.query('DELETE FROM node_view WHERE userId IN (?)', [userIds]);
    await db.query('DELETE FROM notification_settings WHERE userId IN (?)', [
      userIds,
    ]);
    await db.query('DELETE FROM user WHERE id IN (?)', [userIds]);
    await app.close();
  });

  describe('GET /features', () => {
    it('is all off while the switch is off', async () => {
      setFlags(false, true);

      const { body } = await http().get('/api/features').expect(200);

      expect(body).toEqual({
        registration: false,
        registration_approval: false,
      });
    });

    it('is all off while mail is down', async () => {
      setFlags(true, true);
      mailUp.mockReturnValue(false);

      const { body } = await http().get('/api/features').expect(200);

      expect(body).toEqual({
        registration: false,
        registration_approval: false,
      });
    });

    it('reports approval only along with registration', async () => {
      setFlags(true, true);

      const { body } = await http().get('/api/features').expect(200);

      expect(body).toEqual({
        registration: true,
        registration_approval: true,
      });
    });
  });

  describe('without approval', () => {
    it('403s while registration is closed', async () => {
      setFlags(false);

      const { body } = await register(newEmail()).expect(403);

      expect(body.error).toBe('Registration_Closed');
    });

    it('400s an address that is not an email', async () => {
      const { body } = await register('nope').expect(400);

      expect(body.errors).toEqual({ email: expect.any(String) });
    });

    it('mails a link that creates the account once', async () => {
      const email = newEmail();

      const { body } = await register(`  ${email.toUpperCase()} `).expect(200);
      expect(body).toEqual({ status: 'mailed' });

      expect(sendLink).toHaveBeenCalledWith(email, expect.any(String));
      const code = lastCode();

      const row = await rowOf(email);
      expect(row).toMatchObject({ status: 'approved', delivery: 'sent' });
      const ttl = new Date(row.code_expires_at).getTime() - Date.now();
      expect(ttl).toBeGreaterThan(71 * 3600_000);
      expect(ttl).toBeLessThanOrEqual(72 * 3600_000);

      const listed = await http()
        .get('/api/admin/registrations')
        .set(authHeader(admin.id, 'admin'))
        .expect(200);
      expect(
        listed.body.requests.find(
          (item: { email: string }) => item.email === email,
        ).link,
      ).toMatch(new RegExp(`/register/${code}$`));

      const check = await http().get(`/api/auth/register/${code}`).expect(200);
      expect(check.body).toEqual({ email });

      const username = newName();
      const done = await http()
        .put(`/api/auth/register/${code}`)
        .send({ username, password: 'hunter22' })
        .expect(200);

      userIds.push(done.body.user.id);
      expect(done.body.user).toMatchObject({ username, email });

      const me = await http()
        .get('/api/auth/')
        .set('Authorization', `Bearer ${done.body.token}`)
        .expect(200);
      expect(me.body.user.username).toBe(username);

      expect(await rowOf(email)).toMatchObject({
        status: 'completed',
        code: null,
        user_id: done.body.user.id,
      });

      await http()
        .put(`/api/auth/register/${code}`)
        .send({ username: newName(), password: 'hunter22' })
        .expect(404);
    });

    it('limits an address to one request an hour', async () => {
      const email = newEmail();

      await register(email).expect(200);
      const { body } = await register(email).expect(429);

      expect(body.error).toBe('Too_Many_Requests');
    });

    it('mails the same link again until it is used', async () => {
      const email = newEmail();

      await register(email).expect(200);
      const first = lastCode();

      Object.assign(registration, {
        perEmail: new RateLimiter(1000, 60 * 60 * 1000),
      });
      await register(email).expect(200);

      expect(lastCode()).toBe(first);
    });

    it('refuses an address that already has an account', async () => {
      const { username } = await makeUser('user');

      const { body } = await register(
        ` ${username.toUpperCase()}@Example.com`,
      ).expect(409);

      expect(body.error).toBe('User_Exist_With_Email');
      expect(body.message).toBe('Почта уже занята, вы забыли пароль?');
      expect(sendLink).not.toHaveBeenCalled();
      expect(await rowOf(`${username}@example.com`)).toBeUndefined();
    });

    it("refuses an address linked as someone's Google account", async () => {
      const owner = await makeUser('user');
      const email = newEmail();
      await db.query(
        "INSERT INTO social (provider, account_id, userId) VALUES ('google', ?, ?)",
        [email, owner.id],
      );

      try {
        const { body } = await register(email).expect(409);

        expect(body.error).toBe('User_Exist_With_Email');
        expect(await rowOf(email)).toBeUndefined();
      } finally {
        await db.query('DELETE FROM social WHERE userId = ?', [owner.id]);
      }
    });

    it('refuses to complete once the address got taken', async () => {
      const email = newEmail();

      await register(email).expect(200);
      const code = lastCode();

      const taker = await makeUser('user');
      await db.query('UPDATE user SET email = ? WHERE id = ?', [
        email,
        taker.id,
      ]);

      const { body } = await http()
        .put(`/api/auth/register/${code}`)
        .send({ username: newName(), password: 'hunter22' })
        .expect(409);

      expect(body.error).toBe('User_Exist_With_Email');
      expect((await rowOf(email)).status).toBe('approved');

      // Nor does it keep mailing a link that cannot be used.
      const resent = await http()
        .post(`/api/admin/registrations/${(await rowOf(email)).id}/resend`)
        .set(authHeader(admin.id, 'admin'))
        .expect(200);

      expect(resent.body.request).toMatchObject({
        delivery: 'failed',
        last_error: expect.stringContaining('занята'),
        link: null,
      });
    });

    it('refuses a username only a deleted account holds', async () => {
      const gone = await makeUser('user', { email: null, deleted: true });
      const email = newEmail();

      await register(email).expect(200);

      const { body } = await http()
        .put(`/api/auth/register/${lastCode()}`)
        .send({ username: gone.username, password: 'hunter22' })
        .expect(400);

      expect(body.errors).toEqual({ username: expect.any(String) });
      expect((await rowOf(email)).status).toBe('approved');
    });

    it('404s an expired link', async () => {
      const email = newEmail();

      await register(email).expect(200);
      await db.query(
        'UPDATE registration_request SET code_expires_at = NOW() - INTERVAL 1 MINUTE WHERE email = ?',
        [email],
      );

      await http().get(`/api/auth/register/${lastCode()}`).expect(404);
    });
  });

  describe('mail failures', () => {
    it('retries a day apart, then leaves it to an admin', async () => {
      sendLink.mockResolvedValue({ sent: false, error: 'mailbox is full' });
      const email = newEmail();

      const { body } = await register(email).expect(200);
      expect(body).toEqual({ status: 'mailed' });

      let row = await rowOf(email);
      expect(row).toMatchObject({
        delivery: 'queued',
        send_attempts: 1,
        last_error: 'mailbox is full',
        code_expires_at: null,
      });
      const delay = new Date(row.next_attempt_at).getTime() - Date.now();
      expect(delay).toBeGreaterThan(23 * 3600_000);

      for (let attempt = 2; attempt <= 3; attempt += 1) {
        await db.query(
          'UPDATE registration_request SET next_attempt_at = NOW() - INTERVAL 1 MINUTE WHERE email = ?',
          [email],
        );
        await registration.deliverDue();
      }

      row = await rowOf(email);
      expect(row).toMatchObject({
        delivery: 'failed',
        send_attempts: 3,
        next_attempt_at: null,
      });

      const list = await http()
        .get('/api/admin/registrations')
        .set(authHeader(admin.id, 'admin'))
        .expect(200);
      expect(
        list.body.requests.find(
          (item: { email: string }) => item.email === email,
        ),
      ).toMatchObject({
        delivery: 'failed',
        last_error: 'mailbox is full',
        // Never mailed, so there is no working link to hand out.
        link: null,
      });

      sendLink.mockResolvedValue({ sent: true });

      const resent = await http()
        .post(`/api/admin/registrations/${row.id}/resend`)
        .set(authHeader(admin.id, 'admin'))
        .expect(200);

      expect(resent.body.request).toMatchObject({
        delivery: 'sent',
        send_attempts: 0,
        last_error: '',
      });
    });

    it('postpones a due send while mail is down, without spending it', async () => {
      sendLink.mockResolvedValue({ sent: false, error: 'down' });
      const email = newEmail();

      await register(email).expect(200);
      await db.query(
        'UPDATE registration_request SET next_attempt_at = NOW() - INTERVAL 1 MINUTE WHERE email = ?',
        [email],
      );

      mailUp.mockReturnValue(false);
      await registration.deliverDue();

      const row = await rowOf(email);
      expect(row.send_attempts).toBe(1);
      expect(new Date(row.next_attempt_at).getTime()).toBeGreaterThan(
        Date.now() + 50 * 60_000,
      );
    });
  });

  describe('with approval', () => {
    beforeEach(() => setFlags(true, true));

    it('requires a reason', async () => {
      const { body } = await register(newEmail()).expect(400);

      expect(body.errors).toEqual({ reason: expect.any(String) });
    });

    it('waits for an admin, who is told about it', async () => {
      const email = newEmail();

      const { body } = await register(email, 'I like dogs').expect(200);

      expect(body).toEqual({ status: 'awaiting_approval' });
      expect(sendLink).not.toHaveBeenCalled();
      expect(sendApproval).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('@')]),
        email,
        'I like dogs',
      );
      expect(await rowOf(email)).toMatchObject({
        status: 'pending_approval',
        reason: 'I like dogs',
        code: null,
      });

      const updates = await http()
        .get('/api/auth/updates')
        .set(authHeader(admin.id, 'admin'))
        .expect(200);
      expect(updates.body.registrations.pending).toBeGreaterThanOrEqual(1);

      const memberUpdates = await http()
        .get('/api/auth/updates')
        .set(authHeader(member.id))
        .expect(200);
      expect(memberUpdates.body.registrations).toBeUndefined();
    });

    it('mails the link once approved', async () => {
      const email = newEmail();

      await register(email, 'hello').expect(200);
      const { id } = await rowOf(email);

      const { body } = await http()
        .post(`/api/admin/registrations/${id}/approve`)
        .set(authHeader(admin.id, 'admin'))
        .expect(200);

      expect(body.request).toMatchObject({
        status: 'approved',
        delivery: 'sent',
      });
      expect(sendLink).toHaveBeenCalledWith(email, expect.any(String));
      expect((await rowOf(email)).decided_by).toBe(admin.id);
    });

    it('rejects without mail, and lets the guest apply again', async () => {
      const email = newEmail();

      await register(email, 'first try').expect(200);
      const { id } = await rowOf(email);

      await http()
        .post(`/api/admin/registrations/${id}/reject`)
        .set(authHeader(admin.id, 'admin'))
        .expect(200);

      expect(sendLink).not.toHaveBeenCalled();
      expect((await rowOf(email)).status).toBe('rejected');

      Object.assign(registration, {
        perEmail: new RateLimiter(1000, 60 * 60 * 1000),
      });
      await register(email, 'second try').expect(200);

      expect(await rowOf(email)).toMatchObject({
        id,
        status: 'pending_approval',
        reason: 'second try',
        decided_by: null,
      });
    });
  });

  describe('admin endpoints', () => {
    it('are a 404 for guests and members', async () => {
      await http().get('/api/admin/registrations').expect(404);
      await http()
        .get('/api/admin/registrations')
        .set(authHeader(member.id))
        .expect(404);
      await http()
        .post('/api/admin/registrations/1/approve')
        .set(authHeader(member.id))
        .expect(404);
    });

    it('404s acting on a request in the wrong state', async () => {
      const email = newEmail();

      await register(email).expect(200);
      const { id } = await rowOf(email);

      await http()
        .post(`/api/admin/registrations/${id}/approve`)
        .set(authHeader(admin.id, 'admin'))
        .expect(404);
    });
  });
});
