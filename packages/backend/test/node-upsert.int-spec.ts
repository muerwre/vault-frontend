import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  getDataSource,
  notificationWatermark,
} from './helpers/app';

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const YT_THUMB = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';

describe('node upsert (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let notificationMark: number;
  let http: () => ReturnType<typeof request>;

  let authorId: number;
  let strangerId: number;
  let adminId: number;
  let imageId: number;
  let secondImageId: number;
  let audioId: number;

  const createdNodeIds: number[] = [];

  const save = (uid: number, body: Record<string, unknown>) =>
    http().post('/api/nodes/').set(authHeader(uid)).send(body);

  const track = (id: number) => {
    createdNodeIds.push(id);
    return id;
  };

  const makeUser = async (role: 'user' | 'admin' | 'guest'): Promise<number> => {
    const username = `uspec_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
    notificationMark = await notificationWatermark(db);
    http = () => request(app.getHttpServer());

    authorId = await makeUser('user');
    strangerId = await makeUser('user');
    adminId = await makeUser('admin');

    const images = await db.query(
      "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 2",
    );
    imageId = Number(images[0].id);
    secondImageId = Number(images[1].id);

    const [audio] = await db.query("SELECT id FROM file WHERE type = 'audio' LIMIT 1");
    audioId = Number(audio.id);
  });

  afterAll(async () => {
    // Writes here fan out to whoever is subscribed in the seeded database.
    await clearNotificationsAbove(db, notificationMark);

    for (const id of createdNodeIds) {
      await db.query('DELETE FROM node_files_file WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_tags_tag WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM `like` WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    for (const id of [authorId, strangerId, adminId]) {
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }
    await app.close();
  });

  describe('create', () => {
    it('creates an image node from one attached image', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        title: 'my image node',
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.type).toBe('image');
      expect(body.node.title).toBe('my image node');
      expect(body.node.files.map((f: { id: number }) => f.id)).toEqual([imageId]);
      expect(body.node.user.id).toBe(authorId);
    });

    /** New nodes are visible and promoted unless the body says otherwise. */
    it('defaults to public and promoted', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.is_public).toBe(true);
      expect(body.node.is_promoted).toBe(true);
    });

    it('honours an explicit unpromoted flag, creating a lab node', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        is_promoted: false,
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.is_promoted).toBe(false);
    });

    it('creates a text node from a text block', async () => {
      const text = 'x'.repeat(100);
      const { body } = await save(authorId, {
        type: 'text',
        blocks: [{ type: 'text', text }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.blocks).toHaveLength(1);
      // A long text block also becomes the description.
      expect(body.node.description).toBe(text);
    });

    it('creates a video node and derives its thumbnail', async () => {
      const { body } = await save(authorId, {
        type: 'video',
        blocks: [{ type: 'video', url: YT }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.thumbnail).toBe(YT_THUMB);
    });

    it('creates an audio node and accepts a cover image alongside it', async () => {
      const { body } = await save(authorId, {
        type: 'audio',
        files: [{ id: audioId }, { id: imageId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.files.map((f: { id: number }) => f.id)).toEqual([
        audioId,
        imageId,
      ]);
      // Audio nodes store no blocks whatever the client sends.
      expect(body.node.blocks).toEqual([]);
    });

    it('derives the image thumbnail from the first attached image', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      const [file] = await db.query('SELECT url FROM file WHERE id = ?', [imageId]);
      expect(body.node.thumbnail).toBe(file.url);
    });

    it('keeps files in the order supplied and writes the junction', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        files: [{ id: secondImageId }, { id: imageId }],
      }).expect(200);

      const nodeId = track(body.node.id);
      expect(body.node.files_order).toEqual([secondImageId, imageId]);

      const rows = await db.query(
        'SELECT fileId FROM node_files_file WHERE nodeId = ?',
        [nodeId],
      );
      expect(rows).toHaveLength(2);
    });

    it('marks attached files as belonging to nodes', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      const [row] = await db.query('SELECT target FROM file WHERE id = ?', [imageId]);
      expect(row.target).toBe('nodes');
    });

    it('drops files the node type cannot carry', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        files: [{ id: imageId }, { id: audioId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.files_order).toEqual([imageId]);
    });

    it('drops blocks the node type cannot carry', async () => {
      const { body } = await save(authorId, {
        type: 'text',
        blocks: [
          { type: 'text', text: 'kept' },
          { type: 'video', url: YT },
        ],
      }).expect(200);

      track(body.node.id);
      expect(body.node.blocks).toHaveLength(1);
      expect(body.node.blocks[0].type).toBe('text');
    });

    it('truncates an over-long title', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        title: 'x'.repeat(400),
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      // The column is varchar(255), so that is the real ceiling.
      expect(body.node.title).toHaveLength(255);
    });

    describe('rejections', () => {
      it('400s an unknown or uncreatable type', async () => {
        for (const type of ['', 'nonsense', 'boris', 'webm']) {
          const { body } = await save(authorId, { type, files: [{ id: imageId }] }).expect(
            400,
          );
          expect(body.error).toBe('Incorrect_Node_Type');
        }
      });

      it('400s an image node with no image', async () => {
        const { body } = await save(authorId, { type: 'image', files: [] }).expect(400);

        expect(body.error).toBe('Incorrect_Data');
      });

      it('400s a text node with no text block', async () => {
        await save(authorId, { type: 'text', blocks: [] }).expect(400);
        await save(authorId, {
          type: 'text',
          blocks: [{ type: 'text', text: '' }],
        }).expect(400);
      });

      it('400s a video node whose url yields no thumbnail', async () => {
        await save(authorId, {
          type: 'video',
          blocks: [{ type: 'video', url: 'https://vimeo.com/1' }],
        }).expect(400);
      });

      it('400s an audio node with no audio file', async () => {
        await save(authorId, { type: 'audio', files: [] }).expect(400);
        await save(authorId, { type: 'audio', files: [{ id: imageId }] }).expect(400);
      });

      /** Client-declared file types are not trusted; the stored type decides. */
      it('400s when a claimed image is really audio', async () => {
        await save(authorId, {
          type: 'image',
          files: [{ id: audioId, type: 'image' }],
        }).expect(400);
      });

      it('400s when attached ids do not exist', async () => {
        await save(authorId, { type: 'image', files: [{ id: 99999999 }] }).expect(400);
      });

      it('403s a guest role', async () => {
        const guestId = await makeUser('guest');

        const { body } = await http()
          .post('/api/nodes/')
          .set(authHeader(guestId, 'guest'))
          .send({ type: 'image', files: [{ id: imageId }] })
          .expect(403);

        expect(body.error).toBe('Not_Enough_Rights');
        await db.query('DELETE FROM user WHERE id = ?', [guestId]);
      });

      it('401s without a token', async () => {
        await http()
          .post('/api/nodes/')
          .send({ type: 'image', files: [{ id: imageId }] })
          .expect(401);
      });
    });
  });

  describe('update', () => {
    const createImageNode = async (): Promise<number> => {
      const { body } = await save(authorId, {
        type: 'image',
        title: 'before',
        files: [{ id: imageId }],
      }).expect(200);

      return track(body.node.id);
    };

    it('updates the title in place without creating a node', async () => {
      const nodeId = await createImageNode();

      const { body } = await save(authorId, {
        id: nodeId,
        type: 'image',
        title: 'after',
        files: [{ id: imageId }],
      }).expect(200);

      expect(body.node.id).toBe(nodeId);
      expect(body.node.title).toBe('after');
    });

    it('replaces the file set and releases dropped files', async () => {
      const nodeId = await createImageNode();

      const { body } = await save(authorId, {
        id: nodeId,
        type: 'image',
        files: [{ id: secondImageId }],
      }).expect(200);

      expect(body.node.files_order).toEqual([secondImageId]);

      const rows = await db.query(
        'SELECT fileId FROM node_files_file WHERE nodeId = ?',
        [nodeId],
      );
      expect(rows.map((r: { fileId: number }) => Number(r.fileId))).toEqual([
        secondImageId,
      ]);

      const [dropped] = await db.query('SELECT target FROM file WHERE id = ?', [
        imageId,
      ]);
      expect(dropped.target).toBeNull();
    });

    it('lets an admin edit somebody else’s node', async () => {
      const nodeId = await createImageNode();

      await http()
        .post('/api/nodes/')
        .set(authHeader(adminId, 'admin'))
        .send({ id: nodeId, type: 'image', title: 'moderated', files: [{ id: imageId }] })
        .expect(200);
    });

    it('403s a different non-admin user', async () => {
      const nodeId = await createImageNode();

      await save(strangerId, {
        id: nodeId,
        type: 'image',
        title: 'hijack',
        files: [{ id: imageId }],
      }).expect(403);
    });

    it('404s an unknown id', async () => {
      await save(authorId, {
        id: 99999999,
        type: 'image',
        files: [{ id: imageId }],
      }).expect(404);
    });

    it('can move a node into the lab', async () => {
      const nodeId = await createImageNode();

      const { body } = await save(authorId, {
        id: nodeId,
        type: 'image',
        is_promoted: false,
        files: [{ id: imageId }],
      }).expect(200);

      expect(body.node.is_promoted).toBe(false);
    });

    it('sets and clears the cover', async () => {
      const nodeId = await createImageNode();

      const withCover = await save(authorId, {
        id: nodeId,
        type: 'image',
        cover: { id: secondImageId },
        files: [{ id: imageId }],
      }).expect(200);
      expect(withCover.body.node.cover.id).toBe(secondImageId);

      const withoutCover = await save(authorId, {
        id: nodeId,
        type: 'image',
        cover: null,
        files: [{ id: imageId }],
      }).expect(200);
      expect(withoutCover.body.node.cover).toBeNull();
    });

    it('keeps tags across an update', async () => {
      const nodeId = await createImageNode();
      const title = `spec-upsert-${Date.now()}`;

      await http()
        .post(`/api/nodes/${nodeId}/tags`)
        .set(authHeader(authorId))
        .send({ tags: [title] })
        .expect(200);

      const { body } = await save(authorId, {
        id: nodeId,
        type: 'image',
        title: 'retitled',
        files: [{ id: imageId }],
      }).expect(200);

      expect(body.node.tags.map((t: { title: string }) => t.title)).toContain(title);
      await db.query('DELETE FROM tag WHERE title = ?', [title]);
    });
  });
});
