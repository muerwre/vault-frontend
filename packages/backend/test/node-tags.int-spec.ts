import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

describe('node tags (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let authorId: number;
  let strangerId: number;
  const nodeIds: number[] = [];
  const createdTagTitles: string[] = [];

  const makeNode = async (type = 'image'): Promise<number> => {
    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         created_at, updated_at, userId)
       VALUES (?, ?, '[]', '', 1, 1, 0, NOW(), NOW(), ?)`,
      [`tag spec ${Date.now()}`, type, authorId],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    nodeIds.push(id);
    return id;
  };

  const makeUser = async (): Promise<number> => {
    const username = `tagspec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    return Number(row.id);
  };

  const uniqueTitle = (label: string) => {
    const title = `spec-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    createdTagTitles.push(title);
    return title;
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    authorId = await makeUser();
    strangerId = await makeUser();
  });

  afterAll(async () => {
    for (const id of nodeIds) {
      await db.query('DELETE FROM node_tags_tag WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    for (const title of createdTagTitles) {
      await db.query('DELETE FROM tag WHERE title = ?', [title]);
    }
    for (const id of [authorId, strangerId]) {
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }
    await app.close();
  });

  describe('POST /nodes/:id/tags', () => {
    it('creates tags that do not exist and attaches them', async () => {
      const nodeId = await makeNode();
      const title = uniqueTitle('new');

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title] })
        .expect(200);

      expect(body.node.tags.map((t: { title: string }) => t.title)).toContain(title);

      const rows = await db.query('SELECT * FROM tag WHERE title = ?', [title]);
      expect(rows).toHaveLength(1);
    });

    it('reuses an existing tag rather than duplicating it', async () => {
      const first = await makeNode();
      const second = await makeNode();
      const title = uniqueTitle('reuse');

      await http()
        .post(`/api/nodes/${first}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title] })
        .expect(200);
      await http()
        .post(`/api/nodes/${second}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title] })
        .expect(200);

      const rows = await db.query('SELECT * FROM tag WHERE title = ?', [title]);
      expect(rows).toHaveLength(1);
    });

    /** Titles are lowercased, so tags are effectively case-insensitive. */
    it('lowercases incoming titles', async () => {
      const nodeId = await makeNode();
      const title = uniqueTitle('case');

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title.toUpperCase()] })
        .expect(200);

      expect(body.node.tags.map((t: { title: string }) => t.title)).toContain(title);
    });

    it('accumulates across calls without duplicating', async () => {
      const nodeId = await makeNode();
      const a = uniqueTitle('acc-a');
      const b = uniqueTitle('acc-b');

      await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [a] });
      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [a, b] })
        .expect(200);

      const titles = body.node.tags.map((t: { title: string }) => t.title);
      expect(titles).toContain(a);
      expect(titles).toContain(b);
      expect(titles.filter((t: string) => t === a)).toHaveLength(1);
    });

    it('ignores blank titles', async () => {
      const nodeId = await makeNode();

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: ['', '   '] })
        .expect(200);

      expect(body.node.tags).toEqual([]);
    });

    it('treats an empty list as a no-op that still returns the node', async () => {
      const nodeId = await makeNode();

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [] })
        .expect(200);

      expect(body.node.id).toBe(nodeId);
    });

    it('serialises tags with the uppercase ID key', async () => {
      const nodeId = await makeNode();

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [uniqueTitle('shape')] })
        .expect(200);

      expect(Object.keys(body.node.tags[0]).sort()).toEqual(['ID', 'title']);
    });

    it('rejects a different non-admin user', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(strangerId))
        .send({ tags: [uniqueTitle('denied')] })
        .expect(400);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .send({ tags: ['x'] })
        .expect(401);
    });

    it('rejects an unknown node', async () => {
      await http()
        .post('/api/nodes/99999999/tags')
        .set(authHeader(authorId))
        .send({ tags: ['x'] })
        .expect(400);
    });
  });

  describe('DELETE /nodes/:id/tags/:tagId', () => {
    it('removes one tag and returns the rest', async () => {
      const nodeId = await makeNode();
      const keep = uniqueTitle('keep');
      const drop = uniqueTitle('drop');

      const added = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [keep, drop] })
        .expect(200);

      const dropId = added.body.node.tags.find(
        (t: { title: string; ID: number }) => t.title === drop,
      ).ID;

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}/tags/${dropId}`)
        .set(authHeader(authorId))
        .expect(200);

      const titles = body.tags.map((t: { title: string }) => t.title);
      expect(titles).toContain(keep);
      expect(titles).not.toContain(drop);
    });

    /** Detaching must not delete the tag itself — other nodes may use it. */
    it('leaves the tag row in place', async () => {
      const nodeId = await makeNode();
      const title = uniqueTitle('detach');

      const added = await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title] });
      const tagId = added.body.node.tags[0].ID;

      await http()
        .delete(`/api/nodes/${nodeId}/tags/${tagId}`)
        .set(authHeader(authorId))
        .expect(200);

      const rows = await db.query('SELECT * FROM tag WHERE id = ?', [tagId]);
      expect(rows).toHaveLength(1);
    });

    it('is a no-op for a tag the node does not have', async () => {
      const nodeId = await makeNode();

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}/tags/999999`)
        .set(authHeader(authorId))
        .expect(200);

      expect(body.tags).toEqual([]);
    });

    it('400s a non-numeric tag id', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}/tags/abc`)
        .set(authHeader(authorId))
        .expect(400);
    });

    it('404s a different non-admin user', async () => {
      const nodeId = await makeNode();

      await http()
        .delete(`/api/nodes/${nodeId}/tags/1`)
        .set(authHeader(strangerId))
        .expect(404);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http().delete(`/api/nodes/${nodeId}/tags/1`).expect(401);
    });
  });
});
