import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  type DispatchWatermark,
  getDataSource,
  notificationWatermark,
} from './helpers/app';
import {
  deleteFiles,
  type FileType,
  makeFile as makeFileRow,
  readFile,
} from './helpers/fixtures';

const YT = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const YT_THUMB = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg';

describe('node upsert (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let notificationMark: DispatchWatermark;
  let http: () => ReturnType<typeof request>;

  let authorId: number;
  let strangerId: number;
  let adminId: number;
  let imageId: number;
  let secondImageId: number;
  let audioId: number;

  const createdNodeIds: number[] = [];
  const fileIds: number[] = [];

  const makeFile = async (
    type: FileType,
    options?: Parameters<typeof makeFileRow>[3],
  ) => {
    const id = await makeFileRow(db, authorId, type, options);
    fileIds.push(id);

    return id;
  };

  const save = (uid: number, body: Record<string, unknown>) =>
    http().post('/api/nodes/').set(authHeader(uid)).send(body);

  const track = (id: number) => {
    createdNodeIds.push(id);
    return id;
  };

  const makeUser = async (
    role: 'user' | 'admin' | 'guest',
  ): Promise<number> => {
    const username = `uspec_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`, role],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
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

    const [audio] = await db.query(
      "SELECT id FROM file WHERE type = 'audio' LIMIT 1",
    );
    audioId = Number(audio.id);
  });

  afterAll(async () => {
    // Writes here fan out to whoever is subscribed in the seeded database.
    await clearNotificationsAbove(db, notificationMark);

    await deleteFiles(db, fileIds);

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
    it('drops deleted files, keeping the rest in order', async () => {
      const live = await makeFile('image');
      const gone = await makeFile('image', { deleted: true });

      const { body } = await save(authorId, {
        type: 'image',
        title: 'one deleted',
        files: [{ id: gone }, { id: live }],
      }).expect(200);
      track(Number(body.node.id));

      expect(body.node.files.map((file: { id: number }) => file.id)).toEqual([
        live,
      ]);
    });

    it('releases a replaced cover', async () => {
      const audio = await makeFile('audio');
      const firstCover = await makeFile('image', { target: 'nodes' });
      const secondCover = await makeFile('image');

      const { body } = await save(authorId, {
        type: 'audio',
        title: 'covered',
        files: [{ id: audio }],
        cover: { id: firstCover },
      }).expect(200);
      const nodeId = track(Number(body.node.id));

      await save(authorId, {
        id: nodeId,
        type: 'audio',
        title: 'recovered',
        files: [{ id: audio }],
        cover: { id: secondCover },
      }).expect(200);

      expect((await readFile(db, firstCover)).target).toBeNull();
    });

    it('ignores a deleted cover', async () => {
      const audio = await makeFile('audio');
      const goneCover = await makeFile('image', { deleted: true });

      const { body } = await save(authorId, {
        type: 'audio',
        title: 'no cover',
        files: [{ id: audio }],
        cover: { id: goneCover },
      }).expect(200);
      track(Number(body.node.id));

      expect(body.node.cover).toBeFalsy();
    });

    it('creates an image node from one attached image', async () => {
      const { body } = await save(authorId, {
        type: 'image',
        title: 'my image node',
        files: [{ id: imageId }],
      }).expect(200);

      track(body.node.id);
      expect(body.node.type).toBe('image');
      expect(body.node.title).toBe('my image node');
      expect(body.node.files.map((f: { id: number }) => f.id)).toEqual([
        imageId,
      ]);
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
      expect(body.node.thumbnail).toBe(
        'REMOTE_CURRENT://youtube/dQw4w9WgXcQ.jpg',
      );

      // YouTube's url is what is stored; the local one is applied on the way out.
      const [row] = await db.query('SELECT thumbnail FROM node WHERE id = ?', [
        body.node.id,
      ]);
      expect(row.thumbnail).toBe(YT_THUMB);
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
      const [file] = await db.query('SELECT url FROM file WHERE id = ?', [
        imageId,
      ]);
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
      const [row] = await db.query('SELECT target FROM file WHERE id = ?', [
        imageId,
      ]);
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
        type: 'video',
        blocks: [
          { type: 'text', text: 'dropped' },
          { type: 'video', url: YT },
        ],
      }).expect(200);

      track(body.node.id);
      expect(body.node.blocks).toHaveLength(1);
      expect(body.node.blocks[0].type).toBe('video');
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
          const { body } = await save(authorId, {
            type,
            files: [{ id: imageId }],
          }).expect(400);
          expect(body.error).toBe('Incorrect_Node_Type');
        }
      });

      it('400s an image node with no image', async () => {
        const { body } = await save(authorId, {
          type: 'image',
          files: [],
        }).expect(400);

        expect(body.error).toBe('Incorrect_Data');
      });

      it('400s a text node with only empty blocks', async () => {
        await save(authorId, {
          type: 'text',
          blocks: [
            { type: 'text', text: '  ' },
            { type: 'images', mode: 'grid', files: [] },
            { type: 'audio', files: [imageId] },
          ],
          files: [{ id: imageId }],
        }).expect(400);
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
        await save(authorId, {
          type: 'audio',
          files: [{ id: imageId }],
        }).expect(400);
      });

      /** Client-declared file types are not trusted; the stored type decides. */
      it('400s when a claimed image is really audio', async () => {
        await save(authorId, {
          type: 'image',
          files: [{ id: audioId, type: 'image' }],
        }).expect(400);
      });

      it('400s when attached ids do not exist', async () => {
        await save(authorId, {
          type: 'image',
          files: [{ id: 99999999 }],
        }).expect(400);
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

  describe('text node blocks', () => {
    const LONG = 'long enough text '.repeat(5).trim();
    const text = { type: 'text', text: LONG };

    it('keeps every kind of block in order, with the files they show', async () => {
      const photo = await makeFile('image');
      const song = await makeFile('audio');

      const { body } = await save(authorId, {
        type: 'text',
        blocks: [
          { type: 'images', mode: 'grid', files: [{ id: photo }] },
          { type: 'text', text: '' },
          { type: 'text', text: LONG },
          { type: 'video', url: YT },
          { type: 'audio', files: [song] },
        ],
        files: [{ id: song }, { id: photo }],
      }).expect(200);

      track(body.node.id);

      expect(
        body.node.blocks.map((block: { type: string }) => block.type),
      ).toEqual(['images', 'text', 'video', 'audio']);
      expect(body.node.blocks[0].mode).toBe('grid');
      expect(
        body.node.blocks[0].files.map((f: { id: number }) => f.id),
      ).toEqual([photo]);
      expect(
        body.node.blocks[3].files.map((f: { id: number }) => f.id),
      ).toEqual([song]);
      expect(body.node.files_order).toEqual([photo, song]);

      const [stored] = await db.query('SELECT blocks FROM node WHERE id = ?', [
        body.node.id,
      ]);
      const blocks =
        typeof stored.blocks === 'string'
          ? JSON.parse(stored.blocks)
          : stored.blocks;
      expect(blocks[0]).toEqual({
        type: 'images',
        mode: 'grid',
        files: [photo],
      });
    });

    it('leaves out files no block shows, releasing them on edit', async () => {
      const shown = await makeFile('image');
      const dropped = await makeFile('image');

      const { body: created } = await save(authorId, {
        type: 'text',
        blocks: [
          text,
          { type: 'images', mode: 'grid', files: [shown, dropped] },
        ],
        files: [{ id: shown }, { id: dropped }],
      }).expect(200);
      const nodeId = track(created.node.id);

      const { body } = await save(authorId, {
        id: nodeId,
        type: 'text',
        blocks: [text, { type: 'images', mode: 'grid', files: [shown] }],
        files: [{ id: shown }, { id: dropped }],
      }).expect(200);

      expect(body.node.files_order).toEqual([shown]);

      const [row] = await db.query('SELECT target FROM file WHERE id = ?', [
        dropped,
      ]);
      expect(row.target).toBeNull();
    });

    it('takes the thumbnail from the first photo and joins the text', async () => {
      const first = await makeFile('image');
      const second = await makeFile('image');

      const { body } = await save(authorId, {
        type: 'text',
        blocks: [
          { type: 'text', text: 'opening' },
          { type: 'images', mode: 'slider', files: [first, second] },
          text,
        ],
        files: [{ id: first }, { id: second }],
      }).expect(200);

      track(body.node.id);

      const [row] = await db.query('SELECT url FROM file WHERE id = ?', [
        first,
      ]);
      expect(body.node.thumbnail).toContain(row.url);
      expect(body.node.description).toBe(`opening\n\n${LONG}`);
    });

    it('400s with less than 64 characters of text overall', async () => {
      const photo = await makeFile('image');

      await save(authorId, {
        type: 'text',
        blocks: [
          { type: 'text', text: 'x'.repeat(30) },
          { type: 'images', mode: 'grid', files: [photo] },
          { type: 'text', text: 'x'.repeat(30) },
        ],
        files: [{ id: photo }],
      }).expect(400);
    });

    it('drops block files the node was not sent', async () => {
      const sent = await makeFile('audio');
      const unsent = await makeFile('audio');

      const { body } = await save(authorId, {
        type: 'text',
        blocks: [{ type: 'audio', files: [sent, unsent] }, text],
        files: [{ id: sent }],
      }).expect(200);

      track(body.node.id);
      expect(
        body.node.blocks[0].files.map((f: { id: number }) => f.id),
      ).toEqual([sent]);
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
        .send({
          id: nodeId,
          type: 'image',
          title: 'moderated',
          files: [{ id: imageId }],
        })
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

      expect(body.node.tags.map((t: { title: string }) => t.title)).toContain(
        title,
      );
      await db.query('DELETE FROM tag WHERE title = ?', [title]);
    });
  });

  describe('settings', () => {
    it('keeps aura on a song node with a photo, and drops it with the photo', async () => {
      const audio = await makeFile('audio');
      const image = await makeFile('image');

      const { body } = await save(authorId, {
        type: 'audio',
        title: 'aura',
        files: [{ id: audio }, { id: image }],
        settings: { layout: 'aura' },
      }).expect(200);
      const nodeId = track(Number(body.node.id));

      expect(body.node.settings).toEqual({ layout: 'aura' });

      const { body: updated } = await save(authorId, {
        id: nodeId,
        title: 'aura',
        files: [{ id: audio }],
      }).expect(200);

      expect(updated.node.settings).toEqual({});

      const [row] = await db.query('SELECT settings FROM node WHERE id = ?', [
        nodeId,
      ]);
      expect(row.settings).toBeNull();
    });

    it('stores nothing for a song node without photos', async () => {
      const audio = await makeFile('audio');

      const { body } = await save(authorId, {
        type: 'audio',
        title: 'no aura',
        files: [{ id: audio }],
        settings: { layout: 'aura' },
      }).expect(200);
      track(Number(body.node.id));

      expect(body.node.settings).toEqual({});
    });
  });
});
