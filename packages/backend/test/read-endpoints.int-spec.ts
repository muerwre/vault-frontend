import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  createTestApp,
  getDataSource,
  WIRE_DATE,
} from './helpers/app';

describe('read endpoints (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /stats/', () => {
    it('serves both the trailing-slash and bare paths', async () => {
      await http().get('/api/stats/').expect(200);
      await http().get('/api/stats').expect(200);
    });

    it('returns the full shape', async () => {
      const { body } = await http().get('/api/stats/').expect(200);

      expect(Object.keys(body).sort()).toEqual([
        'comments',
        'files',
        'nodes',
        'timestamps',
        'users',
      ]);
      expect(Object.keys(body.nodes).sort()).toEqual([
        'audios',
        'by_month',
        'images',
        'texts',
        'total',
        'videos',
      ]);
    });

    /** `total` is the sum of the four counted types, so webm and boris are out. */
    it('sums nodes.total from the four counted types only', async () => {
      const { body } = await http().get('/api/stats/').expect(200);
      const { images, audios, videos, texts, total } = body.nodes;

      expect(total).toBe(images + audios + videos + texts);

      const [row] = await db.query(
        'SELECT COUNT(*) AS c FROM node WHERE deleted_at IS NULL',
      );
      expect(total).toBeLessThan(Number(row.c));
    });

    it('formats the timestamps as wire dates', async () => {
      const { body } = await http().get('/api/stats/').expect(200);

      expect(body.timestamps.boris_last_comment).toMatch(WIRE_DATE);
      expect(body.timestamps.flow_last_post).toMatch(WIRE_DATE);
    });

    it('returns monthly buckets as numbers', async () => {
      const { body } = await http().get('/api/stats/').expect(200);

      expect(body.nodes.by_month.length).toBeGreaterThan(0);
      expect(
        body.nodes.by_month.every((n: unknown) => typeof n === 'number'),
      ).toBe(true);
    });
  });

  describe('GET /search/nodes', () => {
    it('returns nothing for an empty query rather than listing everything', async () => {
      const { body } = await http().get('/api/search/nodes').expect(200);

      expect(body).toEqual({ total: 0, nodes: [] });
    });

    it('returns nothing when the query sanitises to empty', async () => {
      const { body } = await http()
        .get('/api/search/nodes')
        .query({ text: '@#$%^&' })
        .expect(200);

      expect(body.total).toBe(0);
    });

    it('matches Cyrillic text and returns the trimmed projection', async () => {
      const { body } = await http()
        .get('/api/search/nodes')
        .query({ text: 'дом', take: 3 })
        .expect(200);

      expect(body.total).toBeGreaterThan(0);
      expect(body.nodes.length).toBeLessThanOrEqual(3);
      for (const node of body.nodes) {
        expect(Object.keys(node).sort()).toEqual([
          'created_at',
          'id',
          'is_promoted',
          'thumbnail',
          'title',
        ]);
        expect(node.created_at).toMatch(WIRE_DATE);
      }
    });

    it('shows an authenticated viewer at least as much as a guest', async () => {
      const guest = await http()
        .get('/api/search/nodes')
        .query({ text: 'дом' });
      const user = await http()
        .get('/api/search/nodes')
        .query({ text: 'дом' })
        .set(authHeader(1));

      expect(user.body.total).toBeGreaterThanOrEqual(guest.body.total);
    });

    it('falls back on unparseable paging instead of erroring', async () => {
      await http()
        .get('/api/search/nodes')
        .query({ text: 'дом', take: 'abc', skip: '-5' })
        .expect(200);
    });
  });

  describe('GET /tags/nodes', () => {
    let tagName: string;

    beforeAll(async () => {
      const [row] = await db.query(`
        SELECT t.title FROM tag t
          JOIN node_tags_tag nt ON nt.tagId = t.id
         GROUP BY t.id ORDER BY COUNT(*) DESC LIMIT 1
      `);
      tagName = row.title as string;
    });

    it('returns shallow nodes and a count', async () => {
      const { body } = await http()
        .get('/api/tags/nodes')
        .query({ name: tagName, limit: 2 })
        .expect(200);

      expect(typeof body.count).toBe('number');
      expect(body.nodes.length).toBeLessThanOrEqual(2);
    });

    it('matches the tag name case-insensitively', async () => {
      const upper = await http()
        .get('/api/tags/nodes')
        .query({ name: tagName.toUpperCase() })
        .expect(200);

      expect(upper.body.count).toBeGreaterThan(0);
    });

    it('404s an unknown tag in the frozen envelope', async () => {
      const { body } = await http()
        .get('/api/tags/nodes')
        .query({ name: '__no_such_tag__' })
        .expect(404);

      expect(body.error).toBe('TagNotFound');
    });

    it('shows an authenticated viewer at least as much as a guest', async () => {
      const guest = await http()
        .get('/api/tags/nodes')
        .query({ name: tagName });
      const user = await http()
        .get('/api/tags/nodes')
        .query({ name: tagName })
        .set(authHeader(1));

      expect(user.body.count).toBeGreaterThanOrEqual(guest.body.count);
    });
  });

  describe('GET /tags/autocomplete', () => {
    it('returns bare title strings', async () => {
      const { body } = await http()
        .get('/api/tags/autocomplete')
        .query({ search: 'до' })
        .expect(200);

      expect(Array.isArray(body.tags)).toBe(true);
      expect(body.tags.every((t: unknown) => typeof t === 'string')).toBe(true);
    });

    it('honours exclude', async () => {
      const all = await http()
        .get('/api/tags/autocomplete')
        .query({ search: 'до' });
      const first = all.body.tags[0] as string;

      const { body } = await http()
        .get('/api/tags/autocomplete')
        .query({ search: 'до', exclude: first });

      expect(body.tags).not.toContain(first);
    });

    it('answers with an empty list rather than erroring on no query', async () => {
      const { body } = await http().get('/api/tags/autocomplete').expect(200);

      expect(Array.isArray(body.tags)).toBe(true);
    });
  });

  describe('GET /meta/youtube', () => {
    it('returns cached embeds keyed by id', async () => {
      const rows = await db.query(
        "SELECT address FROM embed WHERE provider = 'youtube' LIMIT 2",
      );
      const ids = rows.map((r: { address: string }) => r.address);

      const { body } = await http()
        .get('/api/meta/youtube')
        .query({ ids: ids.join(',') })
        .expect(200);

      for (const id of ids) {
        expect(body.items[id]).toEqual({
          id: expect.any(Number),
          provider: 'youtube',
          address: id,
          metadata: expect.any(Object),
        });
      }
    });

    it('omits ids it cannot resolve instead of erroring', async () => {
      const { body } = await http()
        .get('/api/meta/youtube')
        .query({ ids: '__definitely_not_a_video__' })
        .expect(200);

      expect(body.items).toEqual({});
    });

    it('returns an empty map with no ids', async () => {
      const { body } = await http().get('/api/meta/youtube').expect(200);

      expect(body.items).toEqual({});
    });
  });

  describe('GET /users/:username', () => {
    it('returns the narrow profile shape', async () => {
      const { body } = await http().get('/api/users/muro').expect(200);

      expect(Object.keys(body.user).sort()).toEqual([
        'cover',
        'created_at',
        'description',
        'fullname',
        'id',
        'photo',
        'role',
        'username',
      ]);
      expect(body.user.created_at).toMatch(WIRE_DATE);
    });

    /** Profiles are narrower than the user embedded in nodes. */
    it('exposes neither email nor last_seen', async () => {
      const { body } = await http().get('/api/users/muro').expect(200);

      expect('email' in body.user).toBe(false);
      expect('last_seen' in body.user).toBe(false);
    });

    it('uses the shallow file shape for photo', async () => {
      const { body } = await http().get('/api/users/muro').expect(200);

      expect(Object.keys(body.user.photo).sort()).toEqual([
        'id',
        'metadata',
        'mime',
        'size',
        'type',
        'url',
      ]);
    });

    it('404s an unknown username', async () => {
      const { body } = await http().get('/api/users/__nobody__').expect(404);

      expect(body.error).toBe('User_Not_found');
    });
  });

  describe('GET /users/:username/nodes', () => {
    it('returns the newest page without a cursor', async () => {
      const { body } = await http().get('/api/users/muro/nodes').expect(200);

      expect(body.nodes.length).toBeGreaterThan(0);
    });

    it('advances past the cursor', async () => {
      const first = await http().get('/api/users/muro/nodes').expect(200);
      const newest = first.body.nodes[0].created_at as string;

      const { body } = await http()
        .get('/api/users/muro/nodes')
        .query({ after: newest })
        .expect(200);

      for (const node of body.nodes) {
        expect(new Date(node.created_at).getTime()).toBeLessThan(
          new Date(newest).getTime(),
        );
      }
    });

    it('ignores an unparseable cursor rather than erroring', async () => {
      const { body } = await http()
        .get('/api/users/muro/nodes')
        .query({ after: 'garbage' })
        .expect(200);

      expect(body.nodes.length).toBeGreaterThan(0);
    });

    it('404s an unknown username', async () => {
      await http().get('/api/users/__nobody__/nodes').expect(404);
    });
  });

  describe('GET /nodes/:id/comments', () => {
    let nodeId: number;
    let total: number;

    beforeAll(async () => {
      const [row] = await db.query(`
        SELECT nodeId, COUNT(*) AS c FROM comment
         WHERE deleted_at IS NULL AND nodeId IS NOT NULL
         GROUP BY nodeId ORDER BY c DESC LIMIT 1
      `);
      nodeId = Number(row.nodeId);
      total = Number(row.c);
    });

    it('reports the node total, not the page size', async () => {
      const { body } = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3 })
        .expect(200);

      expect(body.comment_count).toBe(total);
      expect(body.comments).toHaveLength(3);
    });

    it('returns the documented item shape with a null node', async () => {
      const { body } = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 1 })
        .expect(200);

      expect(Object.keys(body.comments[0]).sort()).toEqual([
        'created_at',
        'files',
        'id',
        'like_count',
        'liked',
        'node',
        'text',
        'updated_at',
        'user',
      ]);
      expect(body.comments[0].node).toBeNull();
    });

    it('sorts descending unless order is exactly ASC', async () => {
      const asc = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3, order: 'ASC' });
      const desc = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3, order: 'DESC' });
      const nonsense = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3, order: 'sideways' });

      const dates = (body: { comments: Array<{ created_at: string }> }) =>
        body.comments.map((c) => c.created_at);

      expect(dates(asc.body)[0] < dates(asc.body)[2]).toBe(true);
      expect(dates(desc.body)).toEqual(dates(nonsense.body));
    });

    it('offsets by skip', async () => {
      const page = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3, order: 'ASC' });
      const skipped = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .query({ take: 3, skip: 1, order: 'ASC' });

      const ids = (body: { comments: Array<{ id: number }> }) =>
        body.comments.map((c) => c.id);

      expect(ids(skipped.body)[0]).toBe(ids(page.body)[1]);
    });

    it('reports liked only for the user who liked it', async () => {
      const [row] = await db.query(`
        SELECT cl.commentId, cl.userId, c.nodeId FROM comment_user_likes cl
          JOIN comment c ON c.id = cl.commentId
         WHERE c.deleted_at IS NULL LIMIT 1
      `);
      const path = `/api/nodes/${Number(row.nodeId)}/comments`;
      const find = (body: {
        comments: Array<{ id: number; liked: boolean; like_count: number }>;
      }) => body.comments.find((c) => c.id === Number(row.commentId));

      const guest = await http().get(path).query({ take: 100 });
      const liker = await http()
        .get(path)
        .query({ take: 100 })
        .set(authHeader(Number(row.userId)));

      expect(find(guest.body)?.liked).toBe(false);
      expect(find(liker.body)?.liked).toBe(true);
      expect(find(guest.body)?.like_count).toBeGreaterThan(0);
    });

    it('404s a non-numeric node id', async () => {
      await http().get('/api/nodes/abc/comments').expect(404);
    });

    it('returns an empty page for a node with no comments', async () => {
      const [row] = await db.query(`
        SELECT n.id FROM node n
         WHERE NOT EXISTS (SELECT 1 FROM comment c WHERE c.nodeId = n.id) LIMIT 1
      `);

      const { body } = await http()
        .get(`/api/nodes/${Number(row.id)}/comments`)
        .expect(200);

      expect(body).toEqual({ comments: [], comment_count: 0 });
    });
  });

  describe('cross-cutting', () => {
    it('answers a preflight with 200 and the required headers', async () => {
      const response = await http()
        .options('/api/stats/')
        .set('Origin', 'https://vault48.org')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'authorization,cache-control')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
      const allowed = (
        response.headers['access-control-allow-headers'] ?? ''
      ).toLowerCase();
      expect(allowed).toContain('authorization');
      expect(allowed).toContain('cache-control');
    });

    it('degrades a garbage token to guest on optional-auth routes', async () => {
      await http()
        .get('/api/nodes/')
        .set('Authorization', 'Bearer garbage')
        .expect(200);
    });

    it('renders an unmatched route in the frozen envelope', async () => {
      const { body } = await http().get('/api/no-such-route').expect(404);

      expect(body).toEqual({
        error: expect.any(String),
        message: expect.any(String),
      });
    });
  });
});
