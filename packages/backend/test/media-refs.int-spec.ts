// Nothing here may reach YouTube: no Data API calls, no cover downloads.
process.env.GOOGLE_API_KEY = '';
process.env.CACHE_YOUTUBE_THUMBS = 'false';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { MediaPlannerService } from '../src/modules/media/media-planner.service';
import { MediaRefsService } from '../src/modules/media/media-refs.service';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  type DispatchWatermark,
  getDataSource,
  notificationWatermark,
} from './helpers/app';

/** Ids no real video has, so nothing here touches the seeded items. */
const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zz${stamp}sp${n}`.padEnd(11, 'q');
const V1 = vid(1);
const V2 = vid(2);
const V3 = vid(3);

describe('media links (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;
  let notificationMark: DispatchWatermark;
  let authorId: number;
  const nodeIds: number[] = [];

  const refsOf = async (ownerType: string, ownerId: number) =>
    (
      (await db.query(
        `SELECT m.external_id FROM external_media_ref r
           JOIN external_media m ON m.id = r.media_id
          WHERE r.owner_type = ? AND r.owner_id = ?
          ORDER BY m.external_id`,
        [ownerType, ownerId],
      )) as Array<{ external_id: string }>
    ).map((row) => row.external_id);

  const mediaRow = async (externalId: string) => {
    const [row] = await db.query(
      `SELECT * FROM external_media WHERE provider = 'youtube' AND external_id = ?`,
      [externalId],
    );
    return row;
  };

  const saveVideoNode = async (urls: string[], id?: number) => {
    const { body } = await http()
      .post('/api/nodes/')
      .set(authHeader(authorId))
      .send({
        id,
        type: 'video',
        title: 'media spec',
        blocks: urls.map((url) => ({ type: 'video', url })),
      })
      .expect(200);

    if (!id) {
      nodeIds.push(body.node.id);
    }

    return body.node.id as number;
  };

  const saveComment = async (nodeId: number, text: string, id?: number) => {
    const { body } = await http()
      .post(`/api/nodes/${nodeId}/comments`)
      .set(authHeader(authorId))
      .send({ id, text, files: [] })
      .expect(200);

    return body.comment.id as number;
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());
    notificationMark = await notificationWatermark(db);

    // Switched on only after boot: the backfill and the planner's timer start
    // during boot, and must not run over the seeded data here.
    process.env.CACHE_EXTERNAL_MEDIA = 'true';

    const username = `mspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    authorId = Number(row.id);
  });

  afterAll(async () => {
    process.env.CACHE_EXTERNAL_MEDIA = '';

    const media = (await db.query(
      `SELECT id FROM external_media WHERE provider = 'youtube' AND external_id IN (?)`,
      [[V1, V2, V3]],
    )) as Array<{ id: number }>;
    const mediaIds = media.map((row) => row.id);

    if (mediaIds.length > 0) {
      await db.query('DELETE FROM media_job WHERE media_id IN (?)', [mediaIds]);
      await db.query('DELETE FROM external_media_ref WHERE media_id IN (?)', [
        mediaIds,
      ]);
      await db.query('DELETE FROM external_media WHERE id IN (?)', [mediaIds]);
    }

    await clearNotificationsAbove(db, notificationMark);

    for (const id of nodeIds) {
      const comments = (await db.query(
        'SELECT id FROM comment WHERE nodeId = ?',
        [id],
      )) as Array<{ id: number }>;

      for (const comment of comments) {
        await db.query(
          `DELETE FROM external_media_ref WHERE owner_type = 'comment' AND owner_id = ?`,
          [comment.id],
        );
      }

      await db.query(
        `DELETE FROM external_media_ref WHERE owner_type = 'node' AND owner_id = ?`,
        [id],
      );
      await db.query('DELETE FROM comment WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_tags_tag WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }

    await db.query('DELETE FROM user WHERE id = ?', [authorId]);
    await app.close();
  });

  it('records the videos of a saved video node', async () => {
    const nodeId = await saveVideoNode([
      `https://youtu.be/${V1}`,
      `https://www.youtube.com/watch?v=${V2}`,
    ]);

    expect(await refsOf('node', nodeId)).toEqual([V1, V2].sort());
    expect(await mediaRow(V1)).toMatchObject({
      video_status: 'none',
      thumb_status: 'none',
      priority: 0,
    });
  });

  it('follows edits: a dropped video loses its link, a new one gains it', async () => {
    const nodeId = await saveVideoNode([`https://youtu.be/${V1}`]);

    await saveVideoNode([`https://youtu.be/${V3}`], nodeId);

    expect(await refsOf('node', nodeId)).toEqual([V3]);
    // The item itself stays; only cleanup removes items nobody links.
    expect(await mediaRow(V1)).toBeDefined();
  });

  it('shares one item between everything that links it', async () => {
    const first = await saveVideoNode([`https://youtu.be/${V2}`]);
    const second = await saveVideoNode([`https://youtu.be/${V2}`]);

    const [{ count }] = await db.query(
      `SELECT COUNT(*) AS count FROM external_media WHERE provider = 'youtube' AND external_id = ?`,
      [V2],
    );

    expect(Number(count)).toBe(1);
    expect(await refsOf('node', first)).toEqual([V2]);
    expect(await refsOf('node', second)).toEqual([V2]);
  });

  it('records links in comment text, and follows comment edits', async () => {
    const nodeId = await saveVideoNode([`https://youtu.be/${V1}`]);
    const commentId = await saveComment(
      nodeId,
      `look https://youtu.be/${V2} and www.youtube.com/watch?v=${V3}`,
    );

    expect(await refsOf('comment', commentId)).toEqual([V2, V3].sort());

    await saveComment(nodeId, 'never mind', commentId);

    expect(await refsOf('comment', commentId)).toEqual([]);
  });

  it('records nothing while the cache is off', async () => {
    process.env.CACHE_EXTERNAL_MEDIA = 'false';

    try {
      const nodeId = await saveVideoNode([`https://youtu.be/${V3}`]);

      expect(await refsOf('node', nodeId)).toEqual([]);
    } finally {
      process.env.CACHE_EXTERNAL_MEDIA = 'true';
    }
  });

  it('raises the priority of an item linked again by fresh content', async () => {
    const refs = app.get(MediaRefsService);
    const ownerId = -1;

    await db.query(
      `UPDATE external_media SET priority = 10 WHERE provider = 'youtube' AND external_id = ?`,
      [V3],
    );
    await refs.syncOwner(
      'comment',
      ownerId,
      [{ provider: 'youtube', id: V3 }],
      0,
    );

    expect((await mediaRow(V3)).priority).toBe(0);

    await refs.syncOwner('comment', ownerId, [], 0);
  });

  it('plans new items into download jobs', async () => {
    await app.get(MediaPlannerService).runOnce();

    const row = await mediaRow(V1);
    expect(row).toMatchObject({ video_status: 'queued', kind: 'video' });

    const jobs = await db.query(
      `SELECT kind, status, priority FROM media_job WHERE media_id = ?`,
      [row.id],
    );
    expect(jobs).toEqual([{ kind: 'download', status: 'queued', priority: 0 }]);
  });
});
