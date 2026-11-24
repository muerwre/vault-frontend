// Mail off, whatever the local env says: the restore flow must never send real
// mail from a spec, and the spec asserts the skipped-send path.
process.env.SMTP_HOST = '';

import { createHash } from 'crypto';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { getJwtSecret } from '../src/config/env';

import {
  authHeader,
  createTestApp,
  getDataSource,
  WIRE_DATE,
} from './helpers/app';
import { deleteFiles, makeFile } from './helpers/fixtures';

const md5 = (value: string) =>
  createHash('md5').update(value, 'utf8').digest('hex');

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
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
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
        'about',
        'about_display',
        'cover',
        'description',
        'email',
        'fullname',
        'id',
        'info',
        'last_seen',
        'last_seen_boris',
        'nodes_view',
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

      const [row] = await db.query('SELECT password FROM user WHERE id = ?', [
        userId,
      ]);
      expect(row.password.startsWith('$2')).toBe(true);
      await expect(bcrypt.compare(PASSWORD, row.password)).resolves.toBe(true);

      // And the same password still works afterwards.
      await login(PASSWORD).expect(200);
    });

    it('does not authenticate the OAuth-only sentinel', async () => {
      await db.query("UPDATE user SET password = 'NO_PASSWORD' WHERE id = ?", [
        userId,
      ]);

      await login('NO_PASSWORD').expect(400);

      await db.query('UPDATE user SET password = ? WHERE id = ?', [
        await bcrypt.hash(PASSWORD, 4),
        userId,
      ]);
    });
  });

  /** A soft-deleted account: the row survives, the session must not. */
  const makeDeletedUser = async (): Promise<number> => {
    const name = `deleted_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW(), NOW())`,
      [name, await bcrypt.hash('x', 4), `${name}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      name,
    ]);
    return Number(row.id);
  };

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

    /**
     * OAuth claims are signed with the same key, and anyone can get one by
     * completing a provider handshake — so a claim must not open a session.
     */
    it('401s an oauth claim used as a session token', async () => {
      const claim = jwt.sign(
        {
          typ: 'oauth_claim',
          provider: 'google',
          id: '1',
          email: 'a@b.c',
          name: 'n',
          photo: '',
        },
        getJwtSecret(),
        { algorithm: 'HS256' },
      );

      await http()
        .get('/api/auth')
        .set('Authorization', `Bearer ${claim}`)
        .expect(401);
      await http()
        .get('/api/notes/')
        .set('Authorization', `Bearer ${claim}`)
        .expect(401);
    });

    it('401s a token carrying no user id', async () => {
      const token = jwt.sign({ nme: 'spec', rol: 'user' }, getJwtSecret(), {
        algorithm: 'HS256',
      });

      await http()
        .get('/api/auth')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    /** Tokens never expire, so a deleted account must be refused at the guard. */
    it('401s a token for a deleted account', async () => {
      const gone = await makeDeletedUser();

      try {
        await http().get('/api/auth').set(authHeader(gone)).expect(401);
      } finally {
        await db.query('DELETE FROM user WHERE id = ?', [gone]);
      }
    });

    it('returns the caller and refreshes last_seen', async () => {
      const { body } = await http()
        .get('/api/auth')
        .set(authHeader(userId))
        .expect(200);

      expect(body.user.id).toBe(userId);

      const [row] = await db.query('SELECT last_seen FROM user WHERE id = ?', [
        userId,
      ]);
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

      const { body } = await patch({
        description: 'only a description',
      }).expect(200);

      expect(body.user.description).toBe('only a description');
      expect(body.user.fullname).toBe('Full Name');
    });

    it('accepts a fullname on its own', async () => {
      const { body } = await patch({ fullname: 'Solo Name' }).expect(200);

      expect(body.user.fullname).toBe('Solo Name');
      expect(body.user.description).toBe('only a description');
    });

    /** Password resets trust the email, so nothing may swap it unproven. */
    it('refuses to change the email, even with the password', async () => {
      const [before] = await db.query('SELECT email FROM user WHERE id = ?', [
        userId,
      ]);

      const { body } = await patch({
        email: `changed_${Date.now()}@example.com`,
        password: PASSWORD,
      }).expect(400);

      expect(body.errors).toEqual({ email: expect.any(String) });

      const [after] = await db.query('SELECT email FROM user WHERE id = ?', [
        userId,
      ]);
      expect(after.email).toBe(before.email);
    });

    it('accepts the current email sent back with other changes', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [
        userId,
      ]);

      await patch({ email: row.email.toUpperCase(), description: 'x' }).expect(
        200,
      );
    });

    it('drops pending reset links when the password changes', async () => {
      await http()
        .post('/api/auth/restore')
        .send({ field: username })
        .expect(201);

      await patch({
        new_password: 'temporary-pass',
        password: PASSWORD,
      }).expect(200);

      const rows = await db.query(
        'SELECT id FROM restore_code WHERE userId = ?',
        [userId],
      );
      expect(rows).toHaveLength(0);

      await patch({
        new_password: PASSWORD,
        password: 'temporary-pass',
      }).expect(200);
    });

    it('rejects a username already in use', async () => {
      const { body } = await patch({
        username: 'muro',
        password: PASSWORD,
      }).expect(400);

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

    it('reads an unsaved profile page as empty', async () => {
      const { body } = await http().get(`/api/users/${username}`).expect(200);

      expect(body.user.about).toBe('');
      expect(body.user.about_display).toBe('');
      expect(body.user.info).toEqual([]);
      expect(body.user.nodes_view).toBe('flow');
    });

    it('saves about, its size and info into the profile', async () => {
      const info = [
        { title: 'ВК', value: 'vk.com/id1' },
        { title: '', value: 'Люблю котов' },
      ];
      const { body } = await patch({
        about: '# hello',
        about_display: 'quadro',
        info: [...info, { title: 'пусто', value: '  ' }],
      }).expect(200);

      expect(body.user.about).toBe('# hello');
      expect(body.user.about_display).toBe('quadro');
      expect(body.user.info).toEqual(info);

      const profile = await http().get(`/api/users/${username}`).expect(200);

      expect(profile.body.user.about).toBe('# hello');
      expect(profile.body.user.about_display).toBe('quadro');
      expect(profile.body.user.info).toEqual(info);
    });

    it('updates one profile field without touching the others', async () => {
      const { body } = await patch({ about_display: 'single' }).expect(200);

      expect(body.user.about).toBe('# hello');
      expect(body.user.about_display).toBe('single');
      expect(body.user.info).toHaveLength(2);
    });

    it('keeps the profile when only user fields change', async () => {
      const { body } = await patch({ fullname: 'Still Linked' }).expect(200);

      expect(body.user.about).toBe('# hello');
      expect(body.user.info).toHaveLength(2);
    });

    it('keeps info and the nodes view side by side in settings', async () => {
      const { body } = await patch({ nodes_view: 'lab' }).expect(200);

      expect(body.user.nodes_view).toBe('lab');
      expect(body.user.info).toHaveLength(2);

      const [row] = await db.query(
        'SELECT settings FROM user_profile WHERE userId = ?',
        [userId],
      );
      expect(JSON.parse(row.settings)).toEqual({
        info: [
          { title: 'ВК', value: 'vk.com/id1' },
          { title: '', value: 'Люблю котов' },
        ],
        nodes_view: 'lab',
      });

      const profile = await http().get(`/api/users/${username}`).expect(200);
      expect(profile.body.user.nodes_view).toBe('lab');
    });

    it('accepts the aura view', async () => {
      const { body } = await patch({ nodes_view: 'aura' }).expect(200);

      expect(body.user.nodes_view).toBe('aura');

      await patch({ nodes_view: 'lab' }).expect(200);
    });

    it('rejects an unknown nodes view', async () => {
      await patch({ nodes_view: 'grid' }).expect(400);
    });

    it('clears info with an empty list', async () => {
      const { body } = await patch({ info: [] }).expect(200);

      expect(body.user.info).toEqual([]);
    });

    it('takes any text, keeping only the first five entries', async () => {
      const { body } = await patch({
        info: ['a', 'b', 'c', 'd', 'e', 'f'].map((value) => ({
          title: '',
          value: `javascript:${value}`,
        })),
      }).expect(200);

      expect(body.user.info.map((it: { value: string }) => it.value)).toEqual([
        'javascript:a',
        'javascript:b',
        'javascript:c',
        'javascript:d',
        'javascript:e',
      ]);
    });

    it('rejects a malformed info list', async () => {
      const { body } = await patch({ info: ['just a string'] }).expect(400);

      expect(body.errors).toEqual({ info: expect.any(String) });
    });

    it('rejects an unknown about size', async () => {
      const { body } = await patch({ about_display: 'huge' }).expect(400);

      expect(body.errors).toEqual({ about_display: expect.any(String) });
    });

    it('rejects an overlong or non-string about', async () => {
      const long = await patch({ about: 'x'.repeat(9000) }).expect(400);
      expect(long.body.errors).toEqual({ about: expect.any(String) });

      const wrong = await patch({ about: 42 }).expect(400);
      expect(wrong.body.errors).toEqual({ about: expect.any(String) });
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
      const [audio] = await db.query(
        "SELECT id FROM file WHERE type = 'audio' LIMIT 1",
      );
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

    it('refuses a deleted image as photo or cover', async () => {
      const gone = await makeFile(db, userId, 'image', { deleted: true });

      try {
        await http()
          .post('/api/auth/photo')
          .set(authHeader(userId))
          .send({ id: gone })
          .expect(400);
        await http()
          .post('/api/auth/cover')
          .set(authHeader(userId))
          .send({ id: gone })
          .expect(400);
      } finally {
        await deleteFiles(db, [gone]);
      }
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
      await http()
        .post('/api/auth/photo')
        .set(authHeader(userId))
        .send({})
        .expect(400);
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

      await http()
        .post('/api/auth/restore')
        .send({ field: username })
        .expect(201);

      const [row] = await db.query(
        'SELECT code FROM restore_code WHERE userId = ?',
        [userId],
      );
      const code = row.code as string;

      // Validation answers 201, not 200.
      const validated = await http()
        .get(`/api/auth/restore/${code}`)
        .expect(201);
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

    it('issues a fresh code on each request, and only the latest works', async () => {
      await db.query('DELETE FROM restore_code WHERE userId = ?', [userId]);

      await http()
        .post('/api/auth/restore')
        .send({ field: username })
        .expect(201);
      const [first] = await db.query(
        'SELECT code FROM restore_code WHERE userId = ?',
        [userId],
      );

      await http()
        .post('/api/auth/restore')
        .send({ field: username })
        .expect(201);
      const rows = await db.query(
        'SELECT code FROM restore_code WHERE userId = ?',
        [userId],
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].code).not.toBe(first.code);
      await http().get(`/api/auth/restore/${first.code}`).expect(404);
      await http().get(`/api/auth/restore/${rows[0].code}`).expect(201);
    });

    it('404s a code older than 72 hours', async () => {
      const [row] = await db.query(
        'SELECT code FROM restore_code WHERE userId = ?',
        [userId],
      );
      await db.query(
        'UPDATE restore_code SET created_at = NOW() - INTERVAL 73 HOUR WHERE userId = ?',
        [userId],
      );

      await http().get(`/api/auth/restore/${row.code}`).expect(404);
      await http()
        .put(`/api/auth/restore/${row.code}`)
        .send({ password: 'whatever-long' })
        .expect(404);
    });

    it('accepts an email as well as a username', async () => {
      const [row] = await db.query('SELECT email FROM user WHERE id = ?', [
        userId,
      ]);

      await http()
        .post('/api/auth/restore')
        .send({ field: row.email })
        .expect(201);
    });

    it('404s an unknown account and an empty field', async () => {
      await http()
        .post('/api/auth/restore')
        .send({ field: 'nobody_here' })
        .expect(404);
      await http().post('/api/auth/restore').send({}).expect(404);
    });

    it('rejects a too-short password with the code error', async () => {
      const [row] = await db.query(
        'SELECT code FROM restore_code WHERE userId = ?',
        [userId],
      );

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
