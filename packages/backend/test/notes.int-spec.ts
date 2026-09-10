import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  createTestApp,
  getDataSource,
  WIRE_DATE,
} from './helpers/app';

describe('notes (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let ownerId: number;
  let otherId: number;

  const makeUser = async (): Promise<number> => {
    const username = `nspec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    return Number(row.id);
  };

  const create = (uid: number, text: string) =>
    http().post('/api/notes/').set(authHeader(uid)).send({ text });

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    ownerId = await makeUser();
    otherId = await makeUser();
  });

  afterAll(async () => {
    for (const id of [ownerId, otherId]) {
      await db.query('DELETE FROM message WHERE fromId = ? OR toId = ?', [
        id,
        id,
      ]);
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }
    await app.close();
  });

  it('requires auth on every route', async () => {
    await http().get('/api/notes/').expect(401);
    await http().post('/api/notes/').send({ text: 'x' }).expect(401);
    await http().put('/api/notes/1').send({ content: 'x' }).expect(401);
    await http().delete('/api/notes/1').expect(401);
  });

  describe('POST /notes/', () => {
    it('creates a note and omits user_id from the response', async () => {
      const { body } = await create(ownerId, 'my first note').expect(200);

      expect(Object.keys(body).sort()).toEqual(['content', 'created_at', 'id']);
      expect(body.content).toBe('my first note');
      expect(body.created_at).toMatch(WIRE_DATE);
    });

    /** A note is a self-message: both ends point at the author. */
    it('stores it as a self-message', async () => {
      const { body } = await create(ownerId, 'self addressed').expect(200);

      const [row] = await db.query(
        'SELECT fromId, toId, text FROM message WHERE id = ?',
        [body.id],
      );
      expect(Number(row.fromId)).toBe(ownerId);
      expect(Number(row.toId)).toBe(ownerId);
      expect(row.text).toBe('self addressed');
    });

    it('rejects empty or whitespace-only text', async () => {
      await create(ownerId, '').expect(400);
      await create(ownerId, '   ').expect(400);
      await http()
        .post('/api/notes/')
        .set(authHeader(ownerId))
        .send({})
        .expect(400);
    });

    it('answers 200, not 201', async () => {
      await create(ownerId, 'status check').expect(200);
    });
  });

  describe('GET /notes/', () => {
    it('returns the list under totalCount, not totalItems', async () => {
      await create(ownerId, 'listed note').expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(Object.keys(body).sort()).toEqual(['list', 'totalCount']);
      expect(typeof body.totalCount).toBe('number');
      expect(body.totalCount).toBeGreaterThan(0);
    });

    it('includes user_id in list items', async () => {
      await create(ownerId, 'with user id').expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(Object.keys(body.list[0]).sort()).toEqual([
        'content',
        'created_at',
        'id',
        'user_id',
      ]);
      expect(body.list[0].user_id).toBe(ownerId);
    });

    it('returns newest first', async () => {
      const first = await create(ownerId, 'older note').expect(200);
      // The column has second precision, so separate the two writes.
      await db.query(
        'UPDATE message SET created_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id = ?',
        [first.body.id],
      );
      const second = await create(ownerId, 'newer note').expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(body.list[0].id).toBe(second.body.id);
    });

    it('never shows another user’s notes', async () => {
      const mine = await create(ownerId, 'mine only').expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(otherId))
        .expect(200);

      expect(body.list.map((n: { id: number }) => n.id)).not.toContain(
        mine.body.id,
      );
    });

    it('honours limit and offset', async () => {
      await create(ownerId, 'page a');
      await create(ownerId, 'page b');

      const page = await http()
        .get('/api/notes/')
        .query({ limit: 1 })
        .set(authHeader(ownerId))
        .expect(200);
      expect(page.body.list).toHaveLength(1);
      // `totalCount` is the total, not the page size.
      expect(page.body.totalCount).toBeGreaterThan(1);

      const next = await http()
        .get('/api/notes/')
        .query({ limit: 1, offset: 1 })
        .set(authHeader(ownerId))
        .expect(200);
      expect(next.body.list[0].id).not.toBe(page.body.list[0].id);
    });

    it('filters by search', async () => {
      const marker = `zzn${Date.now()}`;
      const match = await create(ownerId, `note about ${marker}`).expect(200);
      await create(ownerId, 'unrelated note').expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .query({ search: marker })
        .set(authHeader(ownerId))
        .expect(200);

      expect(body.list.map((n: { id: number }) => n.id)).toEqual([
        match.body.id,
      ]);
    });

    /** Real dialog messages must never leak into notes. */
    it('excludes messages addressed to someone else', async () => {
      await db.query(
        `INSERT INTO message (text, files_order, created_at, updated_at, fromId, toId)
         VALUES ('a real message', '', NOW(), NOW(), ?, ?)`,
        [ownerId, otherId],
      );

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(
        body.list.some(
          (n: { content: string }) => n.content === 'a real message',
        ),
      ).toBe(false);
    });

    it('excludes empty-text rows', async () => {
      await db.query(
        `INSERT INTO message (text, files_order, created_at, updated_at, fromId, toId)
         VALUES ('', '', NOW(), NOW(), ?, ?)`,
        [ownerId, ownerId],
      );

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(body.list.some((n: { content: string }) => n.content === '')).toBe(
        false,
      );
    });
  });

  describe('PUT /notes/:id', () => {
    it('reads content, not text', async () => {
      const created = await create(ownerId, 'before edit').expect(200);

      const { body } = await http()
        .put(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .send({ content: 'after edit' })
        .expect(200);

      expect(body.content).toBe('after edit');
      expect(body.id).toBe(created.body.id);
    });

    it('persists the change', async () => {
      const created = await create(ownerId, 'persist me').expect(200);

      await http()
        .put(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .send({ content: 'persisted' })
        .expect(200);

      const [row] = await db.query('SELECT text FROM message WHERE id = ?', [
        created.body.id,
      ]);
      expect(row.text).toBe('persisted');
    });

    it('rejects empty content', async () => {
      const created = await create(ownerId, 'keep me').expect(200);

      await http()
        .put(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .send({ content: '  ' })
        .expect(400);
    });

    it('404s another user’s note rather than forbidding it', async () => {
      const created = await create(ownerId, 'not yours').expect(200);

      const { body } = await http()
        .put(`/api/notes/${created.body.id}`)
        .set(authHeader(otherId))
        .send({ content: 'hijack' })
        .expect(404);

      expect(body.error).toBe('NoteNotFound');
    });

    it('404s unknown and non-numeric ids', async () => {
      await http()
        .put('/api/notes/99999999')
        .set(authHeader(ownerId))
        .send({ content: 'x' })
        .expect(404);
      await http()
        .put('/api/notes/abc')
        .set(authHeader(ownerId))
        .send({ content: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /notes/:id', () => {
    it('removes the note from the list', async () => {
      const created = await create(ownerId, 'doomed note').expect(200);

      await http()
        .delete(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .expect(200);

      const { body } = await http()
        .get('/api/notes/')
        .set(authHeader(ownerId))
        .expect(200);

      expect(body.list.map((n: { id: number }) => n.id)).not.toContain(
        created.body.id,
      );
    });

    /** Soft delete: the row survives with deleted_at set. */
    it('soft-deletes rather than dropping the row', async () => {
      const created = await create(ownerId, 'soft deleted').expect(200);

      await http()
        .delete(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .expect(200);

      const [row] = await db.query(
        'SELECT deleted_at FROM message WHERE id = ?',
        [created.body.id],
      );
      expect(row.deleted_at).not.toBeNull();
    });

    it('404s another user’s note', async () => {
      const created = await create(ownerId, 'protected').expect(200);

      await http()
        .delete(`/api/notes/${created.body.id}`)
        .set(authHeader(otherId))
        .expect(404);
    });

    it('404s a note that is already deleted', async () => {
      const created = await create(ownerId, 'twice').expect(200);

      await http()
        .delete(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .expect(200);
      await http()
        .delete(`/api/notes/${created.body.id}`)
        .set(authHeader(ownerId))
        .expect(404);
    });
  });
});
