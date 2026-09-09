import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource, WIRE_DATE } from './helpers/app';

/**
 * Writes need their own rows: these specs mutate what they touch, so every
 * fixture is created here and removed afterwards rather than borrowing real data.
 */
describe('node writes (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let authorId: number;
  let strangerId: number;
  let adminId: number;
  const createdNodeIds: number[] = [];

  const makeNode = async (
    overrides: {
      type?: string;
      isPromoted?: boolean;
      userId?: number | null;
      deletedAt?: string | null;
      isHeroic?: boolean;
    } = {},
  ): Promise<number> => {
    const {
      type = 'image',
      isPromoted = true,
      userId = authorId,
      deletedAt = null,
      isHeroic = false,
    } = overrides;

    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         created_at, updated_at, userId, deleted_at)
       VALUES (?, ?, '[]', '', 1, ?, ?, NOW(), NOW(), ?, ?)`,
      [`spec node ${Date.now()}`, type, isPromoted ? 1 : 0, isHeroic ? 1 : 0, userId, deletedAt],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    createdNodeIds.push(id);

    return id;
  };

  const makeUser = async (role: 'user' | 'admin'): Promise<number> => {
    const username = `spec_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`, role],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [username]);

    return Number(row.id);
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    authorId = await makeUser('user');
    strangerId = await makeUser('user');
    adminId = await makeUser('admin');
  });

  afterAll(async () => {
    for (const id of createdNodeIds) {
      await db.query('DELETE FROM `like` WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    for (const id of [authorId, strangerId, adminId]) {
      await db.query('DELETE FROM `like` WHERE userId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE userId = ?', [id]);
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }
    await app.close();
  });

  describe('POST /nodes/:id/like', () => {
    it('toggles on and back off', async () => {
      const nodeId = await makeNode();

      const on = await http()
        .post(`/api/nodes/${nodeId}/like`)
        .set(authHeader(authorId))
        .expect(200);
      expect(on.body).toEqual({ is_liked: true });

      const off = await http()
        .post(`/api/nodes/${nodeId}/like`)
        .set(authHeader(authorId))
        .expect(200);
      expect(off.body).toEqual({ is_liked: false });
    });

    it('writes and removes the join row', async () => {
      const nodeId = await makeNode();

      await http().post(`/api/nodes/${nodeId}/like`).set(authHeader(authorId));
      let rows = await db.query('SELECT * FROM `like` WHERE nodeId = ? AND userId = ?', [
        nodeId,
        authorId,
      ]);
      expect(rows).toHaveLength(1);

      await http().post(`/api/nodes/${nodeId}/like`).set(authHeader(authorId));
      rows = await db.query('SELECT * FROM `like` WHERE nodeId = ? AND userId = ?', [
        nodeId,
        authorId,
      ]);
      expect(rows).toHaveLength(0);
    });

    it('is reflected in the node read', async () => {
      const nodeId = await makeNode();

      await http().post(`/api/nodes/${nodeId}/like`).set(authHeader(strangerId));

      const { body } = await http()
        .get(`/api/nodes/${nodeId}`)
        .set(authHeader(strangerId))
        .expect(200);

      expect(body.node.is_liked).toBe(true);
      expect(body.node.like_count).toBe(1);
    });

    it('lets a different user like the same node independently', async () => {
      const nodeId = await makeNode();

      await http().post(`/api/nodes/${nodeId}/like`).set(authHeader(authorId));
      await http().post(`/api/nodes/${nodeId}/like`).set(authHeader(strangerId));

      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);
      expect(body.node.like_count).toBe(2);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http().post(`/api/nodes/${nodeId}/like`).expect(401);
    });

    it('404s an unknown node and a soft-deleted one', async () => {
      const deleted = await makeNode({ deletedAt: '2020-01-01 00:00:00' });

      await http().post('/api/nodes/99999999/like').set(authHeader(authorId)).expect(404);
      await http()
        .post(`/api/nodes/${deleted}/like`)
        .set(authHeader(authorId))
        .expect(404);
    });

    /** boris is neither flow nor lab, so it cannot be liked. */
    it('reports false for a type that cannot be liked', async () => {
      const nodeId = await makeNode({ type: 'boris' });

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/like`)
        .set(authHeader(authorId))
        .expect(200);

      expect(body).toEqual({ is_liked: false });
      const rows = await db.query('SELECT * FROM `like` WHERE nodeId = ?', [nodeId]);
      expect(rows).toHaveLength(0);
    });
  });

  describe('POST /nodes/:id/heroic', () => {
    it('lets an admin toggle the flag and persists it', async () => {
      const nodeId = await makeNode();

      const on = await http()
        .post(`/api/nodes/${nodeId}/heroic`)
        .set(authHeader(adminId, 'admin'))
        .expect(200);
      expect(on.body).toEqual({ is_heroic: true });

      const [row] = await db.query('SELECT is_heroic FROM node WHERE id = ?', [nodeId]);
      expect(Number(row.is_heroic)).toBe(1);

      const off = await http()
        .post(`/api/nodes/${nodeId}/heroic`)
        .set(authHeader(adminId, 'admin'))
        .expect(200);
      expect(off.body).toEqual({ is_heroic: false });
    });

    it('404s for a non-admin, including the author', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/heroic`)
        .set(authHeader(authorId))
        .expect(404);
    });

    it('404s for an admin on a type that is neither flow nor lab', async () => {
      const nodeId = await makeNode({ type: 'boris' });

      await http()
        .post(`/api/nodes/${nodeId}/heroic`)
        .set(authHeader(adminId, 'admin'))
        .expect(404);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http().post(`/api/nodes/${nodeId}/heroic`).expect(401);
    });
  });

  describe('POST /nodes/:id/cell-view', () => {
    it('persists the flow settings for the author', async () => {
      const nodeId = await makeNode();
      const flow = {
        display: 'quadro',
        show_description: true,
        dominant_color: '#123456',
      };

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/cell-view`)
        .set(authHeader(authorId))
        .send({ flow })
        .expect(200);

      expect(body.flow).toEqual(flow);

      const read = await http().get(`/api/nodes/${nodeId}`).expect(200);
      expect(read.body.node.flow).toEqual(flow);
    });

    it('allows an admin who is not the author', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/cell-view`)
        .set(authHeader(adminId, 'admin'))
        .send({ flow: { display: 'vertical', show_description: false } })
        .expect(200);
    });

    it('404s a different non-admin user', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/cell-view`)
        .set(authHeader(strangerId))
        .send({ flow: { display: 'single', show_description: false } })
        .expect(404);
    });

    /** Writes require a known variant, even though stored rows may hold `''`. */
    it('400s an empty or unknown display', async () => {
      const nodeId = await makeNode();

      for (const display of ['', 'sideways']) {
        await http()
          .post(`/api/nodes/${nodeId}/cell-view`)
          .set(authHeader(authorId))
          .send({ flow: { display, show_description: false } })
          .expect(400);
      }
    });

    it('400s a missing flow', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/cell-view`)
        .set(authHeader(authorId))
        .send({})
        .expect(400);
    });

    it('accepts every known variant', async () => {
      const nodeId = await makeNode();

      for (const display of ['single', 'vertical', 'horizontal', 'quadro']) {
        await http()
          .post(`/api/nodes/${nodeId}/cell-view`)
          .set(authHeader(authorId))
          .send({ flow: { display, show_description: false } })
          .expect(200);
      }
    });
  });

  describe('DELETE /nodes/:id', () => {
    it('locks a node and returns the deletion timestamp', async () => {
      const nodeId = await makeNode();

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at).toMatch(WIRE_DATE);

      const [row] = await db.query('SELECT deleted_at FROM node WHERE id = ?', [nodeId]);
      expect(row.deleted_at).not.toBeNull();
    });

    it('hides a locked node from guests but keeps it for the author', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId));

      await http().get(`/api/nodes/${nodeId}`).expect(404);
      await http().get(`/api/nodes/${nodeId}`).set(authHeader(authorId)).expect(200);
    });

    it('restores a locked node and reports a null timestamp', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId));

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'false' })
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at).toBeNull();
      await http().get(`/api/nodes/${nodeId}`).expect(200);
    });

    /** Restoring requires finding an already-deleted row. */
    it('can restore a node that was already deleted', async () => {
      const nodeId = await makeNode({ deletedAt: '2020-01-01 00:00:00' });

      await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'false' })
        .set(authHeader(authorId))
        .expect(200);

      await http().get(`/api/nodes/${nodeId}`).expect(200);
    });

    it('treats a missing is_locked as a restore', async () => {
      const nodeId = await makeNode({ deletedAt: '2020-01-01 00:00:00' });

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}`)
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at).toBeNull();
    });

    it('404s a different non-admin user', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(strangerId))
        .expect(404);
    });

    it('allows an admin to lock any flow node', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(adminId, 'admin'))
        .expect(200);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http().delete(`/api/nodes/${nodeId}`).expect(401);
    });

    it('404s an unknown node', async () => {
      await http()
        .delete('/api/nodes/99999999')
        .set(authHeader(authorId))
        .expect(404);
    });
  });
});
