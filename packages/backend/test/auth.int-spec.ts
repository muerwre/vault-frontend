import { createHash } from 'crypto';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource, WIRE_DATE } from './helpers/app';

const md5 = (value: string) => createHash('md5').update(value, 'utf8').digest('hex');

const PASSWORD = 'spec-password';

describe('auth (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  /** A throwaway account per run, so specs never mutate real rows. */
  let username: string;
  let userId: number;

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    username = `spec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash(PASSWORD, 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    userId = Number(row.id);
  });

  afterAll(async () => {
    await db.query('DELETE FROM restore_code WHERE userId = ?', [userId]);
    await db.query('DELETE FROM node_view WHERE userId = ?', [userId]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  const login = (password: string) =>
    http().post('/api/auth').send({ username, password });

  describe('POST /auth', () => {
    /** Nest's @Post default of 201 would be wrong here. */
    it('answers 200, not 201', async () => {
      await login(PASSWORD).expect(200);
    });

    it('returns a token and the wide self shape', async () => {
      const { body } = await login(PASSWORD).expect(200);

      expect(typeof body.token).toBe('string');
      expect(Object.keys(body.user).sort()).toEqual([
        'cover',
        'description',
        'email',
        'fullname',
        'id',
        'last_seen',
        'last_seen_boris',
        'photo',
        'role',
        'username',
      ]);
      expect(body.user.last_seen_boris).toMatch(WIRE_DATE);
    });

    /** A 401 would make clients drop their session. */
    it('answers 400 for a wrong password, not 401', async () => {
      const { body } = await login('wrong').expect(400);

      expect(body.error).toBe('Incorrect_Data');
    });

    it('answers 400 for an unknown user, indistinguishable from a wrong password', async () => {
      const { body } = await http()
        .post('/api/auth')
        .send({ username: 'no_such_user_at_all', password: 'x' })
        .expect(400);

      expect(body.error).toBe('Incorrect_Data');
    });

    it('rejects empty credentials', async () => {
      await http().post('/api/auth').send({}).expect(400);
    });

    it('upgrades a legacy MD5 hash to bcrypt on successful login', async () => {
      await db.query('UPDATE user SET password = ? WHERE id = ?', [
        md5(PASSWORD),
        userId,
      ]);

      await login(PASSWORD).expect(200);

      const [row] = await db.query('SELECT password FROM user WHERE id = ?', [userId]);
      expect(row.password.startsWith('$2')).toBe(true);
      await expect(bcrypt.compare(PASSWORD, row.password)).resolves.toBe(true);

      // And the same password still works afterwards.
      await login(PASSWORD).expect(200);
    });

    it('does not authenticate the OAuth-only sentinel', async () => {
      await db.query("UPDATE user SET password = 'NO_PASSWORD' WHERE id = ?", [userId]);

      await login('NO_PASSWORD').expect(400);

      await db.query('UPDATE user SET password = ? WHERE id = ?', [
        await bcrypt.hash(PASSWORD, 4),
        userId,
      ]);
    });
  });

  describe('GET /auth', () => {
    it('401s without a token', async () => {
      const { body } = await http().get('/api/auth').expect(401);

      expect(body.error).toBe('NotAuthorized');
    });

    it('401s a token signed with the wrong secret', async () => {
      await http()
        .get('/api/auth')
        .set('Authorization', 'Bearer not.a.token')
        .expect(401);
    });

    it('returns the caller and refreshes last_seen', async () => {
      const { body } = await http()
        .get('/api/auth')
        .set(authHeader(userId))
        .expect(200);

      expect(body.user.id).toBe(userId);

      const [row] = await db.query('SELECT last_seen FROM user WHERE id = ?', [userId]);
      expect(row.last_seen).not.toBeNull();
    });
  });

  describe('GET /auth/updates', () => {
    it('returns only the boris timestamp', async () => {
      const { body } = await http()
        .get('/api/auth/updates')
        .set(authHeader(userId))
        .expect(200);

      expect(Object.keys(body)).toEqual(['boris']);
      expect(body.boris.commented_at).toMatch(WIRE_DATE);
    });

    it('requires auth', async () => {
      await http().get('/api/auth/updates').expect(401);
    });
  });

  describe('PATCH /auth', () => {
    const patch = (payload: Record<string, unknown>) =>
      http().patch('/api/auth').set(authHeader(userId)).send(payload);

    it('accepts a description on its own without touching fullname', async () => {
      await patch({ fullname: 'Full Name' }).expect(200);

      const { body } = await patch({ description: 'only a description' }).expect(200);

      expect(body.user.description).toBe('only a description');
      expect(body.user.fullname).toBe('Full Name');
    });

    it('accepts a fullname on its own', async () => {
      const { body } = await patch({ fullname: 'Solo Name' }).expect(200);

      expect(body.user.fullname).toBe('Solo Name');
      expect(body.user.description).toBe('only a description');
    });

    it('requires the current password to change the email', async () => {
      const { body } = await patch({ email: 'other@example.com' }).expect(400);

      expect(body.error).toBe('Incorrect_Data');
      expect(body.errors).toEqual({ password: expect.any(String) });
    });

    it('changes the email when the password is supplied', async () => {
      const email = `changed_${Date.now()}@example.com`;
      const { body } = await patch({ email, password: PASSWORD }).expect(200);

      expect(body.user.email).toBe(email);
    });

    it('rejects a username already in use', async () => {
      const { body } = await patch({ username: 'muro', password: PASSWORD }).expect(400);

      expect(body.errors).toEqual({ username: expect.any(String) });
    });

    it('rejects a too-short new password', async () => {
      const { body } = await patch({
        new_password: 'abc',
        password: PASSWORD,
      }).expect(400);

      expect(body.errors).toEqual({ new_password: expect.any(String) });
    });

    it('changes the password and invalidates the old one', async () => {
      const next = 'another-password';

      await patch({ new_password: next, password: PASSWORD }).expect(200);

      await login(next).expect(200);
      await login(PASSWORD).expect(400);

      // Restore for the remaining specs.
      await db.query('UPDATE user SET password = ? WHERE id = ?', [
        await bcrypt.hash(PASSWORD, 4),
        userId,
      ]);
    });

    it('requires auth', async () => {
      await http().patch('/api/auth').send({}).expect(401);
    });
  });

  describe('photo and cover', () => {
    let imageId: number;
    let audioId: number;

    beforeAll(async () => {
      const [image] = await db.query(
        "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 1",
      );
      const [audio] = await db.query("SELECT id FROM file WHERE type = 'audio' LIMIT 1");
      imageId = Number(image.id);
      audioId = Number(audio.id);
    });

    it('sets and clears the photo, answering 200 not 201', async () => {
      const set = await http()
        .post('/api/auth/photo')
        .set(authHeader(userId))
        .send({ id: imageId })
        .expect(200);
      expect(set.body.user.photo.id).toBe(imageId);

      const cleared = await http()
        .delete('/api/auth/photo')
        .set(authHeader(userId))
        .expect(200);
      expect(cleared.body.user.photo).toBeNull();
    });

    it('sets and clears the cover', async () => {
      const set = await http()
        .post('/api/auth/cover')
        .set(authHeader(userId))
        .send({ id: imageId })
        .expect(200);
      expect(set.body.user.cover.id).toBe(imageId);

      const cleared = await http()
        .delete('/api/auth/cover')
        .set(authHeader(userId))
        .expect(200);
      expect(cleared.body.user.cover).toBeNull();
    });

    it('rejects a non-image file', async () => {
      await http()
        .post('/api/auth/photo')
        .set(authHeader(userId))
        .send({ id: audioId })
        .expect(400);
    });

    it('rejects a missing or unknown id', async () => {
      await http().post('/api/auth/photo').set(authHeader(userId)).send({}).expect(400);
      await http()
        .post('/api/auth/photo')
        .set(authHeader(userId))
        .send({ id: 99999999 })
        .expect(400);
    });
  });

  describe('restore flow', () => {
    it('runs request → validate → apply → consume', async () => {
      await db.query('DELETE FROM restore_code WHERE userId = ?', [userId]);

      // Mail is skipped when SMTP_HOST is unset, so this succeeds locally.
      await http().post('/api/auth/restore').send({ field: username }).expect(201);

      const [row] = await db.query('SELECT code FROM restore_code WHERE userId = ?', [
        userId,
      ]);
      const code = row.code as string;

      // Validation answers 201, not 200.
      const validated = await http().get(`/api/auth/restore/${code}`).expect(201);
      expect(validated.body.user.username).toBe(username);

      const next = 'restored-password';
      const applied = await http()
        .put(`/api/auth/restore/${code}`)
        .send({ password: next })
        .expect(200);
      expect(typeof applied.body.token).toBe('string');
      expect(applied.body.user.username).toBe(username);

      // The code is single-use.
      await http().get(`/api/auth/restore/${code}`).expect(404);
      await login(next).expect(200);

      await db.query('UPDATE user SET password = ? WHERE id = ?', [
        await bcrypt.hash(PASSWORD, 4),
        userId,
      ]);
    });

    it('reuses one code per user until it is consumed', async () => {
      await db.query('DELETE FROM restore_code WHERE userId = ?', [userId]);

      await http().post('/api/auth/restore').send({ field: username }).expect(201);
      await http().post('/api/auth/restore').send({ field: username }).expect(201);

      const rows = await db.query('SELECT code FROM restore_code WHERE userId = ?', [
        userId,
      ]);
      expect(rows).toHaveLength(1);
    });

    it('accepts an email as well as a username', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [userId]);

      await http().post('/api/auth/restore').send({ field: row.email }).expect(201);
    });

    it('404s an unknown account and an empty field', async () => {
      await http().post('/api/auth/restore').send({ field: 'nobody_here' }).expect(404);
      await http().post('/api/auth/restore').send({}).expect(404);
    });

    it('rejects a too-short password with the code error', async () => {
      const [row] = await db.query('SELECT code FROM restore_code WHERE userId = ?', [
        userId,
      ]);

      const { body } = await http()
        .put(`/api/auth/restore/${row.code}`)
        .send({ password: 'abc' })
        .expect(404);

      expect(body.error).toBe('Code_Is_Invalid');
    });

    it('404s an unknown code', async () => {
      await http().get('/api/auth/restore/not-a-real-code').expect(404);
    });
  });
});
