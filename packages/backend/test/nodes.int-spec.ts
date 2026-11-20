import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  createTestApp,
  getDataSource,
  WIRE_DATE,
} from './helpers/app';

const SLICES = ['before', 'after', 'heroes', 'updated', 'recent'] as const;

describe('nodes (integration)', () => {
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

  describe('GET /nodes/ — flow diff', () => {
    it('always returns every slice as an array, even with all flags off', async () => {
      const { body } = await http().get('/api/nodes/').expect(200);

      for (const slice of SLICES) {
        expect(Array.isArray(body[slice])).toBe(true);
      }
      expect(Array.isArray(body.valid)).toBe(true);
    });

    it('reads the with_* flags as bool flags: 1 and t are true', async () => {
      const on = await http().get('/api/nodes/?with_heroes=1').expect(200);
      const alsoOn = await http().get('/api/nodes/?with_heroes=t').expect(200);
      const off = await http().get('/api/nodes/?with_heroes=0').expect(200);

      expect(on.body.heroes.length).toBeGreaterThan(0);
      expect(alsoOn.body.heroes.length).toBeGreaterThan(0);
      expect(off.body.heroes).toEqual([]);
    });

    it('400s a flag or a date it cannot read', async () => {
      await http().get('/api/nodes/?with_recent=maybe').expect(400);
      await http().get('/api/nodes/?start=not-a-date').expect(400);
    });

    it('omits slices whose flag is off', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({ with_heroes: 'false', with_valid: 'false' })
        .expect(200);

      expect(body.heroes).toEqual([]);
      expect(body.valid).toEqual([]);
    });

    it('sends the tracks of a song node for its cell to play', async () => {
      const [song] = await db.query(
        `SELECT n.id, n.created_at FROM node n
         WHERE n.type = 'audio' AND n.is_promoted = 1 AND n.is_public = 1
           AND n.deleted_at IS NULL
           AND EXISTS (SELECT 1 FROM node_files_file nf
             JOIN file f ON f.id = nf.fileId
             WHERE nf.nodeId = n.id AND f.type = 'audio')
         ORDER BY n.created_at DESC LIMIT 1`,
      );

      // the node is the newest one older than `end`, so it heads the page
      const end = new Date(new Date(song.created_at).getTime() + 1000);
      const { body } = await http()
        .get('/api/nodes/')
        .query({ end: end.toISOString(), take: 5 })
        .expect(200);

      const cell = body.after.find(
        (it: { id: number }) => it.id === Number(song.id),
      );
      expect(cell).toBeDefined();

      // the same tracks, in the same order, as the node page plays
      const { body: page } = await http()
        .get(`/api/nodes/${song.id}`)
        .expect(200);
      const tracks = page.node.files
        .filter((file: { type: string }) => file.type === 'audio')
        .slice(0, 10);

      expect(cell.songs).toEqual(tracks);

      const others = body.after.filter(
        (it: { type: string }) => it.type !== 'audio',
      );
      expect(others.every((it: object) => !('songs' in it))).toBe(true);
    });

    it('honours take for the after slice', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({ take: 3 })
        .expect(200);

      expect(body.after).toHaveLength(3);
    });

    it('returns heroic images only, randomised between calls', async () => {
      const first = await http()
        .get('/api/nodes/')
        .query({ with_heroes: 'true' });
      const second = await http()
        .get('/api/nodes/')
        .query({ with_heroes: 'true' });

      expect(first.body.heroes.length).toBeGreaterThan(0);
      expect(
        first.body.heroes.every((n: { type: string }) => n.type === 'image'),
      ).toBe(true);

      const ids = (body: { heroes: Array<{ id: number }> }) =>
        body.heroes.map((n) => n.id).join(',');
      expect(ids(first.body)).not.toBe(ids(second.body));
    });

    it('gives guests an empty updated slice', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({ with_updated: 'true' })
        .expect(200);

      expect(body.updated).toEqual([]);
    });

    it('populates updated for a user with unseen comments', async () => {
      const [row] = await db.query(`
        SELECT nv.userId AS uid FROM node_view nv
          JOIN node n ON n.id = nv.nodeId
         WHERE nv.visited < n.commented_at AND n.deleted_at IS NULL
           AND n.is_promoted = 1 AND n.is_public = 1
         GROUP BY nv.userId ORDER BY COUNT(*) DESC LIMIT 1
      `);

      const { body } = await http()
        .get('/api/nodes/')
        .query({ with_updated: 'true' })
        .set(authHeader(Number(row.uid)))
        .expect(200);

      expect(body.updated.length).toBeGreaterThan(0);
    });

    it('excludes updated ids from recent', async () => {
      const [row] = await db.query(`
        SELECT nv.userId AS uid FROM node_view nv
          JOIN node n ON n.id = nv.nodeId
         WHERE nv.visited < n.commented_at AND n.deleted_at IS NULL
           AND n.is_promoted = 1 AND n.is_public = 1
         GROUP BY nv.userId ORDER BY COUNT(*) DESC LIMIT 1
      `);

      const { body } = await http()
        .get('/api/nodes/')
        .query({ with_updated: 'true', with_recent: 'true' })
        .set(authHeader(Number(row.uid)))
        .expect(200);

      const updated = new Set(body.updated.map((n: { id: number }) => n.id));
      const overlap = body.recent.filter((n: { id: number }) =>
        updated.has(n.id),
      );

      expect(overlap).toEqual([]);
    });

    it('only lists recent nodes that have been commented on', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({ with_recent: 'true' })
        .expect(200);

      expect(body.recent.length).toBeGreaterThan(0);
      for (const node of body.recent) {
        expect(node.commented_at).not.toBe('0001-01-01T00:00:00Z');
      }
    });

    it('returns valid as numeric ids inside the window', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({
          start: '2026-05-04T00:00:00.000Z',
          end: '2020-01-01T00:00:00.000Z',
          with_valid: 'true',
        })
        .expect(200);

      expect(body.valid.length).toBeGreaterThan(0);
      expect(body.valid.every((id: unknown) => Number.isInteger(id))).toBe(
        true,
      );
    });

    it('serialises shallow nodes with wire-format dates and a zero-object author', async () => {
      const { body } = await http()
        .get('/api/nodes/')
        .query({ take: 5 })
        .expect(200);

      for (const node of body.after) {
        expect(node.created_at).toMatch(WIRE_DATE);
        expect(node.commented_at).toMatch(WIRE_DATE);
        expect(typeof node.thumbnail).toBe('string');
        expect(typeof node.description).toBe('string');
        expect(node.flow).toEqual(
          expect.objectContaining({ display: expect.any(String) }),
        );
        expect(typeof node.user.photo).toBe('string');
      }
    });
  });

  describe('GET /nodes/:id', () => {
    let nodeId: number;

    beforeAll(async () => {
      const [row] = await db.query(`
        SELECT n.id FROM node n
         WHERE n.files_order <> '' AND n.deleted_at IS NULL AND n.coverId IS NOT NULL
           AND EXISTS (SELECT 1 FROM node_tags_tag t WHERE t.nodeId = n.id)
         ORDER BY n.id DESC LIMIT 1
      `);
      nodeId = Number(row.id);
    });

    it('orders files by files_order, not by the join table', async () => {
      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

      expect(body.node.files.map((f: { id: number }) => f.id)).toEqual(
        body.node.files_order,
      );
    });

    it('serialises tags with an uppercase ID key', async () => {
      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

      expect(body.node.tags.length).toBeGreaterThan(0);
      for (const tag of body.node.tags) {
        expect(Object.keys(tag).sort()).toEqual(['ID', 'title']);
      }
    });

    it('omits last_seen entirely for a guest', async () => {
      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

      expect('last_seen' in body).toBe(false);
      expect(body.node.is_liked).toBe(false);
    });

    it('reports the previous visit in last_seen and then bumps it', async () => {
      const [row] = await db.query(
        'SELECT userId AS uid FROM node_view WHERE nodeId = ? LIMIT 1',
        [nodeId],
      );
      const uid = Number(row.uid);

      const first = await http()
        .get(`/api/nodes/${nodeId}`)
        .set(authHeader(uid))
        .expect(200);
      const second = await http()
        .get(`/api/nodes/${nodeId}`)
        .set(authHeader(uid))
        .expect(200);

      expect(first.body.last_seen).toMatch(WIRE_DATE);
      // The second call must see what the first one wrote.
      expect(new Date(second.body.last_seen).getTime()).toBeGreaterThanOrEqual(
        new Date(first.body.last_seen).getTime(),
      );
    });

    it('excludes email from the embedded author', async () => {
      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

      expect(body.node.user).not.toBeNull();
      expect('email' in body.node.user).toBe(false);
    });

    it('returns backlinks as provider/link pairs', async () => {
      const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

      expect(Array.isArray(body.backlinks)).toBe(true);
      for (const link of body.backlinks) {
        expect(Object.keys(link).sort()).toEqual(['link', 'provider']);
      }
    });

    it('404s an unknown id in the frozen envelope', async () => {
      const { body } = await http().get('/api/nodes/99999999').expect(404);

      expect(body).toEqual({
        error: 'Node_Not_Found',
        message: expect.any(String),
      });
    });

    it('404s a non-numeric id', async () => {
      await http().get('/api/nodes/not-a-number').expect(404);
    });

    describe('soft-deleted nodes', () => {
      let deletedId: number;
      let ownerId: number;

      beforeAll(async () => {
        const [row] = await db.query(
          'SELECT id, userId FROM node WHERE deleted_at IS NOT NULL AND userId IS NOT NULL LIMIT 1',
        );
        deletedId = Number(row.id);
        ownerId = Number(row.userId);
      });

      it('hides them from guests', async () => {
        await http().get(`/api/nodes/${deletedId}`).expect(404);
      });

      it('hides them from other users', async () => {
        await http()
          .get(`/api/nodes/${deletedId}`)
          .set(authHeader(ownerId + 100000))
          .expect(404);
      });

      it('shows them to their author', async () => {
        await http()
          .get(`/api/nodes/${deletedId}`)
          .set(authHeader(ownerId))
          .expect(200);
      });

      it('shows them to admins', async () => {
        await http()
          .get(`/api/nodes/${deletedId}`)
          .set(authHeader(1, 'admin'))
          .expect(200);
      });
    });
  });

  describe('GET /nodes/:id/related', () => {
    it('groups album tags by title and ranks similar nodes', async () => {
      const [row] = await db.query(`
        SELECT nt.nodeId AS id FROM node_tags_tag nt
          JOIN tag t ON t.id = nt.tagId
          JOIN node n ON n.id = nt.nodeId
         WHERE t.title LIKE '/%' AND n.is_promoted = 1 AND n.deleted_at IS NULL
         LIMIT 1
      `);

      const { body } = await http()
        .get(`/api/nodes/${Number(row.id)}/related`)
        .expect(200);

      expect(Object.keys(body.related.albums).length).toBeGreaterThan(0);

      for (const items of Object.values(body.related.albums)) {
        for (const item of items as Array<Record<string, unknown>>) {
          expect(Object.keys(item).sort()).toEqual([
            'id',
            'is_promoted',
            'thumbnail',
            'title',
          ]);
        }
      }
    });

    it('returns empty results for an untagged node rather than a 404', async () => {
      const [row] = await db.query(`
        SELECT n.id FROM node n
         WHERE n.deleted_at IS NULL
           AND n.is_promoted = 1
           AND n.type IN ('image', 'video', 'text', 'audio')
           AND NOT EXISTS (SELECT 1 FROM node_tags_tag t WHERE t.nodeId = n.id)
         LIMIT 1
      `);

      const { body } = await http()
        .get(`/api/nodes/${Number(row.id)}/related`)
        .expect(200);

      expect(body).toEqual({ related: { albums: {}, similar: [] } });
    });

    it('404s an unknown node', async () => {
      await http().get('/api/nodes/99999999/related').expect(404);
    });

    describe('flow and lab', () => {
      const tagTitle = `relspec_${Date.now().toString(36)}`;
      const nodeIds: number[] = [];
      let tagId: number;
      let flowSource: number;
      let flowSibling: number;
      let labSource: number;
      let labSibling: number;

      const lastId = async () =>
        Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);

      /** A text node carrying the spec's tag. */
      const tagged = async (isPromoted: boolean) => {
        await db.query(
          `INSERT INTO node (title, type, blocks, files_order, is_public, is_promoted,
                             is_heroic, created_at, updated_at)
           VALUES ('related spec', 'text', '[]', '', 1, ?, 0, NOW(), NOW())`,
          [isPromoted ? 1 : 0],
        );
        const id = await lastId();
        nodeIds.push(id);
        await db.query(
          'INSERT INTO node_tags_tag (nodeId, tagId) VALUES (?, ?)',
          [id, tagId],
        );
        return id;
      };

      const similarIds = async (
        nodeId: number,
        headers: Record<string, string> = {},
      ) => {
        const { body } = await http()
          .get(`/api/nodes/${nodeId}/related`)
          .set(headers)
          .expect(200);

        return (body.related.similar as Array<{ id: number }>)
          .map((item) => item.id)
          .sort((a, b) => a - b);
      };

      beforeAll(async () => {
        await db.query(
          `INSERT INTO tag (title, data, created_at, updated_at)
           VALUES (?, '{}', NOW(), NOW())`,
          [tagTitle],
        );
        tagId = await lastId();

        flowSource = await tagged(true);
        flowSibling = await tagged(true);
        labSource = await tagged(false);
        labSibling = await tagged(false);
      });

      afterAll(async () => {
        await db.query('DELETE FROM node_tags_tag WHERE tagId = ?', [tagId]);
        await db.query('DELETE FROM node WHERE id IN (?)', [nodeIds]);
        await db.query('DELETE FROM tag WHERE id = ?', [tagId]);
      });

      it('shows a guest only flow nodes', async () => {
        expect(await similarIds(flowSource)).toEqual([flowSibling]);
      });

      it('shows a member flow and lab nodes alike', async () => {
        expect(await similarIds(flowSource, authHeader(1))).toEqual(
          [flowSibling, labSource, labSibling].sort((a, b) => a - b),
        );
        expect(await similarIds(labSource, authHeader(1))).toEqual(
          [flowSource, flowSibling, labSibling].sort((a, b) => a - b),
        );
      });

      it('404s a lab node to a guest', async () => {
        await http().get(`/api/nodes/${labSource}/related`).expect(404);
      });
    });

    it('400s a non-numeric id', async () => {
      await http().get('/api/nodes/abc/related').expect(400);
    });
  });
});
