import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

describe('admin users API (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;
  const ids: Record<string, number> = {};
  const stamp = Date.now().toString(36);

  /** A user last seen `seenHoursAgo` ago, or never. */
  const makeUser = async (
    key: string,
    role: 'user' | 'admin',
    seenHoursAgo: number | null,
  ) => {
    const username = `auspec_${key}_${stamp}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, last_seen, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, NOW(), NOW())`,
      [
        username,
        await bcrypt.hash('x', 4),
        `${username}@example.com`,
        role,
        seenHoursAgo === null
          ? null
          : new Date(Date.now() - seenHoursAgo * 3600_000),
      ],
    );
    ids[key] = Number(
      (await db.query('SELECT id FROM user WHERE username = ?', [username]))[0]
        .id,
    );
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    // seen in the future, so they lead the list whatever the seed holds
    await makeUser('admin', 'admin', -3);
    await makeUser('recent', 'user', -2);
    await makeUser('older', 'user', -1);
    await makeUser('never', 'user', null);

    await db.query(
      `INSERT INTO social (provider, account_id, userId) VALUES ('vkontakte', ?, ?)`,
      [`spec${stamp}`, ids.recent],
    );
  });

  afterAll(async () => {
    await db.query('DELETE FROM social WHERE userId IN (?)', [
      Object.values(ids),
    ]);
    await db.query('DELETE FROM user WHERE id IN (?)', [Object.values(ids)]);
    await app.close();
  });

  it('is a 404 for guests and users', async () => {
    await http().get('/api/admin/users').expect(404);
    await http()
      .get('/api/admin/users')
      .set(authHeader(ids.recent))
      .expect(404);
    await http()
      .get('/api/admin/users')
      .set(authHeader(ids.recent, 'admin'))
      .expect(404);
  });

  it('lists users most recently seen first, the never seen last', async () => {
    const { body } = await http()
      .get('/api/admin/users')
      .set(authHeader(ids.admin, 'admin'))
      .expect(200);

    const order = (body.users as Array<{ id: number }>).map((user) => user.id);

    expect(order.slice(0, 3)).toEqual([ids.admin, ids.recent, ids.older]);
    expect(order.indexOf(ids.never)).toBeGreaterThan(order.indexOf(ids.older));
    expect(body.users[0]).toMatchObject({
      username: `auspec_admin_${stamp}`,
      role: 'admin',
      last_seen: expect.any(String),
    });
    expect(body.users[0]).toHaveProperty('photo');
  });

  it('lists the accounts each user can sign in with', async () => {
    const { body } = await http()
      .get('/api/admin/users')
      .set(authHeader(ids.admin, 'admin'))
      .expect(200);

    const byId = new Map(
      (body.users as Array<{ id: number; accounts: unknown[] }>).map((user) => [
        user.id,
        user.accounts,
      ]),
    );

    expect(byId.get(ids.recent)).toEqual([
      { provider: 'vkontakte', account_id: `spec${stamp}` },
    ]);
    expect(byId.get(ids.never)).toEqual([]);
  });

  describe('DELETE /admin/users/:id', () => {
    it('is a 404 for members', async () => {
      await http()
        .delete(`/api/admin/users/${ids.never}`)
        .set(authHeader(ids.recent))
        .expect(404);
    });

    it('refuses to delete yourself or another admin', async () => {
      const self = await http()
        .delete(`/api/admin/users/${ids.admin}`)
        .set(authHeader(ids.admin, 'admin'))
        .expect(400);
      expect(self.body.message).toBe('Нельзя удалить самого себя');

      await makeUser('admin2', 'admin', null);
      const other = await http()
        .delete(`/api/admin/users/${ids.admin2}`)
        .set(authHeader(ids.admin, 'admin'))
        .expect(400);
      expect(other.body.message).toBe('Нельзя удалить администратора');
    });

    it('404s an unknown user', async () => {
      await http()
        .delete('/api/admin/users/999999999')
        .set(authHeader(ids.admin, 'admin'))
        .expect(404);
    });

    /** Tokens never expire, so deletion must end them everywhere. */
    it('soft-deletes, hides the user and ends their sessions', async () => {
      // A session in use before the deletion, so its state is cached.
      await http().get('/api/nodes/lab').set(authHeader(ids.older)).expect(200);

      await http()
        .delete(`/api/admin/users/${ids.older}`)
        .set(authHeader(ids.admin, 'admin'))
        .expect(200);

      const [row] = await db.query('SELECT deleted_at FROM user WHERE id = ?', [
        ids.older,
      ]);
      expect(row.deleted_at).not.toBeNull();

      const { body } = await http()
        .get('/api/admin/users')
        .set(authHeader(ids.admin, 'admin'))
        .expect(200);
      expect(
        (body.users as Array<{ id: number }>).some(
          (user) => user.id === ids.older,
        ),
      ).toBe(false);

      await http().get('/api/auth/').set(authHeader(ids.older)).expect(401);
      await http().get('/api/nodes/lab').set(authHeader(ids.older)).expect(404);
      await http().get('/api/notes').set(authHeader(ids.older)).expect(401);

      // Deleting again finds nobody.
      await http()
        .delete(`/api/admin/users/${ids.older}`)
        .set(authHeader(ids.admin, 'admin'))
        .expect(404);
    });
  });
});
