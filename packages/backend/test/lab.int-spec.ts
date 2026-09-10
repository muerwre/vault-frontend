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

describe('lab (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let userId: number;
  const nodeIds: number[] = [];
  const commentIds: number[] = [];

  const makeLabNode = async (
    overrides: {
      title?: string;
      isHeroic?: boolean;
      isPromoted?: boolean;
      isPublic?: boolean;
      description?: string;
    } = {},
  ): Promise<number> => {
    const {
      title = `lab spec ${Date.now()}`,
      isHeroic = false,
      isPromoted = false,
      isPublic = true,
      description = '',
    } = overrides;

    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         description, created_at, updated_at, userId)
       VALUES (?, 'image', '[]', '', ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        title,
        isPublic ? 1 : 0,
        isPromoted ? 1 : 0,
        isHeroic ? 1 : 0,
        description,
        userId,
      ],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    nodeIds.push(id);
    return id;
  };

  const addComment = async (nodeId: number): Promise<number> => {
    await db.query(
      `INSERT INTO comment (text, files_order, created_at, updated_at, userId, nodeId)
       VALUES ('lab spec comment', '', NOW(), NOW(), ?, ?)`,
      [userId, nodeId],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    commentIds.push(id);

    await db.query('UPDATE node SET commented_at = NOW() WHERE id = ?', [
      nodeId,
    ]);

    return id;
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    const username = `labspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    userId = Number(row.id);
  });

  afterAll(async () => {
    for (const id of commentIds) {
      await db.query('DELETE FROM comment WHERE id = ?', [id]);
    }
    for (const id of nodeIds) {
      await db.query('DELETE FROM comment WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM `like` WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    await db.query('DELETE FROM node_view WHERE userId = ?', [userId]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  describe('GET /nodes/lab', () => {
    it('requires auth', async () => {
      await http().get('/api/nodes/lab').expect(401);
    });

    /** The literal path must not be captured as a node id. */
    it('is not swallowed by the :id route', async () => {
      const { body } = await http()
        .get('/api/nodes/lab')
        .set(authHeader(userId))
        .expect(200);

      expect(Array.isArray(body.nodes)).toBe(true);
      expect(typeof body.count).toBe('number');
    });

    it('returns the documented item shape', async () => {
      await makeLabNode();

      const { body } = await http()
        .get('/api/nodes/lab')
        .set(authHeader(userId))
        .expect(200);

      expect(Object.keys(body.nodes[0]).sort()).toEqual([
        'comment_count',
        'last_seen',
        'node',
      ]);
      expect(typeof body.nodes[0].comment_count).toBe('number');
    });

    it('lists unpromoted nodes and excludes promoted ones', async () => {
      const labId = await makeLabNode({ title: `lab-only-${Date.now()}` });
      const flowId = await makeLabNode({
        title: `flow-only-${Date.now()}`,
        isPromoted: true,
      });

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const ids = body.nodes.map(
        (item: { node: { id: number } }) => item.node.id,
      );
      expect(ids).toContain(labId);
      expect(ids).not.toContain(flowId);
    });

    it('excludes non-public nodes', async () => {
      const hidden = await makeLabNode({ isPublic: false });

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const ids = body.nodes.map(
        (item: { node: { id: number } }) => item.node.id,
      );
      expect(ids).not.toContain(hidden);
    });

    it('honours limit and offset', async () => {
      await makeLabNode();
      await makeLabNode();

      const first = await http()
        .get('/api/nodes/lab')
        .query({ limit: 1 })
        .set(authHeader(userId))
        .expect(200);
      expect(first.body.nodes).toHaveLength(1);

      const second = await http()
        .get('/api/nodes/lab')
        .query({ limit: 1, offset: 1 })
        .set(authHeader(userId))
        .expect(200);

      expect(second.body.nodes[0].node.id).not.toBe(
        first.body.nodes[0].node.id,
      );
      // `count` is the total, not the page size.
      expect(first.body.count).toBeGreaterThan(1);
    });

    it('filters by search across title and description', async () => {
      const marker = `zzsearch${Date.now()}`;
      const byTitle = await makeLabNode({ title: `has ${marker} inside` });
      const byDescription = await makeLabNode({
        description: `desc ${marker}`,
      });

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ search: marker, limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const ids = body.nodes.map(
        (item: { node: { id: number } }) => item.node.id,
      );
      expect(ids).toContain(byTitle);
      expect(ids).toContain(byDescription);
    });

    it('restricts the heroic sort to heroic nodes', async () => {
      const heroic = await makeLabNode({ isHeroic: true });
      const plain = await makeLabNode();

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ sort: 'heroic', limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const ids = body.nodes.map(
        (item: { node: { id: number } }) => item.node.id,
      );
      expect(ids).toContain(heroic);
      expect(ids).not.toContain(plain);
    });

    /** The hot sort inner-joins comments and likes, so quiet nodes drop out. */
    it('omits nodes with no activity from the hot sort', async () => {
      const quiet = await makeLabNode();

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ sort: 'hot', limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const ids = body.nodes.map(
        (item: { node: { id: number } }) => item.node.id,
      );
      expect(ids).not.toContain(quiet);
    });

    it('falls back to the default sort on an unknown value', async () => {
      const sane = await http()
        .get('/api/nodes/lab')
        .query({ sort: 'new', limit: 5 })
        .set(authHeader(userId));
      const nonsense = await http()
        .get('/api/nodes/lab')
        .query({ sort: 'sideways', limit: 5 })
        .set(authHeader(userId));

      expect(nonsense.body.count).toBe(sane.body.count);
    });

    it('reports the comment count per node', async () => {
      const nodeId = await makeLabNode();
      await addComment(nodeId);
      await addComment(nodeId);

      const { body } = await http()
        .get('/api/nodes/lab')
        .query({ limit: 100 })
        .set(authHeader(userId))
        .expect(200);

      const item = body.nodes.find(
        (candidate: { node: { id: number } }) => candidate.node.id === nodeId,
      );
      expect(item.comment_count).toBe(2);
    });

    it('reports last_seen as null until the node is opened', async () => {
      const nodeId = await makeLabNode();

      const before = await http()
        .get('/api/nodes/lab')
        .query({ limit: 100 })
        .set(authHeader(userId))
        .expect(200);
      const untouched = before.body.nodes.find(
        (candidate: { node: { id: number } }) => candidate.node.id === nodeId,
      );
      expect(untouched.last_seen).toBeNull();

      await http()
        .get(`/api/nodes/${nodeId}`)
        .set(authHeader(userId))
        .expect(200);

      const after = await http()
        .get('/api/nodes/lab')
        .query({ limit: 100 })
        .set(authHeader(userId))
        .expect(200);
      const seen = after.body.nodes.find(
        (candidate: { node: { id: number } }) => candidate.node.id === nodeId,
      );
      expect(seen.last_seen).toMatch(WIRE_DATE);
    });
  });

  describe('GET /nodes/lab/updates', () => {
    it('requires auth', async () => {
      await http().get('/api/nodes/lab/updates').expect(401);
    });

    it('lists lab nodes commented on since the caller last opened them', async () => {
      const nodeId = await makeLabNode();

      await db.query(
        `INSERT INTO node_view (nodeId, userId, visited)
         VALUES (?, ?, DATE_SUB(NOW(), INTERVAL 1 DAY))`,
        [nodeId, userId],
      );
      await addComment(nodeId);

      const { body } = await http()
        .get('/api/nodes/lab/updates')
        .set(authHeader(userId))
        .expect(200);

      expect(body.nodes.map((n: { id: number }) => n.id)).toContain(nodeId);
    });

    it('omits nodes the caller has already caught up on', async () => {
      const nodeId = await makeLabNode();
      await addComment(nodeId);
      await db.query(
        'INSERT INTO node_view (nodeId, userId, visited) VALUES (?, ?, NOW())',
        [nodeId, userId],
      );

      const { body } = await http()
        .get('/api/nodes/lab/updates')
        .set(authHeader(userId))
        .expect(200);

      expect(body.nodes.map((n: { id: number }) => n.id)).not.toContain(nodeId);
    });
  });

  describe('GET /nodes/lab/stats', () => {
    it('requires auth', async () => {
      await http().get('/api/nodes/lab/stats').expect(401);
    });

    it('returns tags, heroes and an always-empty comments list', async () => {
      const { body } = await http()
        .get('/api/nodes/lab/stats')
        .set(authHeader(userId))
        .expect(200);

      expect(Object.keys(body).sort()).toEqual(['comments', 'heroes', 'tags']);
      expect(body.comments).toEqual([]);
      expect(Array.isArray(body.tags)).toBe(true);
      expect(Array.isArray(body.heroes)).toBe(true);
    });

    it('serialises tags with the uppercase ID key', async () => {
      const { body } = await http()
        .get('/api/nodes/lab/stats')
        .set(authHeader(userId))
        .expect(200);

      if (body.tags.length > 0) {
        expect(Object.keys(body.tags[0]).sort()).toEqual(['ID', 'title']);
      }
    });

    it('includes a heroic lab node among the heroes', async () => {
      const heroic = await makeLabNode({ isHeroic: true });

      const { body } = await http()
        .get('/api/nodes/lab/stats')
        .set(authHeader(userId))
        .expect(200);

      expect(body.heroes.map((n: { id: number }) => n.id)).toContain(heroic);
    });
  });
});
