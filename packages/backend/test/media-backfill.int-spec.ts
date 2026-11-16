process.env.GOOGLE_API_KEY = '';
process.env.CACHE_YOUTUBE_THUMBS = 'false';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { DataSource } from 'typeorm';

import { MediaBackfillService } from '../src/modules/media/media-backfill.service';

import { createTestApp, getDataSource } from './helpers/app';

const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zy${stamp}bf${n}`.padEnd(11, 'q');
const IN_NODE = vid(1);
const IN_COMMENT = vid(2);
const IN_DELETED = vid(3);

/**
 * Scans the whole seeded database. It only ever adds rows, at backfill
 * priority, which never outranks an existing one; everything above the
 * watermarks taken first is removed afterwards.
 */
describe('media backfill (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let userId: number;
  let nodeId: number;
  let deletedNodeId: number;
  let commentId: number;
  const marks = { media: 0, ref: 0, job: 0 };

  const maxId = async (table: string) =>
    Number(
      (await db.query(`SELECT COALESCE(MAX(id), 0) AS id FROM ${table}`))[0].id,
    );

  const insertNode = async (url: string, deleted: boolean) => {
    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         created_at, updated_at, deleted_at, userId)
       VALUES ('backfill spec', 'video', ?, '', 1, 1, 0, NOW(), NOW(), ?, ?)`,
      [
        JSON.stringify([{ type: 'video', url }]),
        deleted ? new Date() : null,
        userId,
      ],
    );
    return Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);
  };

  const refsOf = async (ownerType: string, ownerId: number) =>
    (
      (await db.query(
        `SELECT m.external_id FROM external_media_ref r
           JOIN external_media m ON m.id = r.media_id
          WHERE r.owner_type = ? AND r.owner_id = ?`,
        [ownerType, ownerId],
      )) as Array<{ external_id: string }>
    ).map((row) => row.external_id);

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);

    marks.media = await maxId('external_media');
    marks.ref = await maxId('external_media_ref');
    marks.job = await maxId('media_job');

    const username = `bspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    userId = Number(
      (await db.query('SELECT id FROM user WHERE username = ?', [username]))[0]
        .id,
    );

    nodeId = await insertNode(`https://youtu.be/${IN_NODE}`, false);
    deletedNodeId = await insertNode(`https://youtu.be/${IN_DELETED}`, true);

    await db.query(
      `INSERT INTO comment (text, files_order, nodeId, userId, created_at, updated_at)
       VALUES (?, '', ?, ?, NOW(), NOW())`,
      [
        `old link: https://www.youtube.com/watch?v=${IN_COMMENT}`,
        nodeId,
        userId,
      ],
    );
    commentId = Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);

    process.env.CACHE_EXTERNAL_MEDIA = 'true';
  });

  afterAll(async () => {
    process.env.CACHE_EXTERNAL_MEDIA = '';

    await db.query('DELETE FROM media_job WHERE id > ?', [marks.job]);
    await db.query('DELETE FROM external_media_ref WHERE id > ?', [marks.ref]);
    await db.query('DELETE FROM external_media WHERE id > ?', [marks.media]);
    await db.query('DELETE FROM comment WHERE id = ?', [commentId]);
    await db.query('DELETE FROM node WHERE id IN (?)', [
      [nodeId, deletedNodeId],
    ]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  it('records links of existing nodes and comments at backfill priority', async () => {
    await app.get(MediaBackfillService).run();

    expect(await refsOf('node', nodeId)).toEqual([IN_NODE]);
    expect(await refsOf('comment', commentId)).toEqual([IN_COMMENT]);

    const [row] = await db.query(
      `SELECT priority, video_status FROM external_media WHERE external_id = ?`,
      [IN_NODE],
    );
    expect(row).toEqual({ priority: 10, video_status: 'none' });
  }, 120_000);

  it('skips deleted content', async () => {
    expect(await refsOf('node', deletedNodeId)).toEqual([]);
  });

  it('can run again without duplicating anything', async () => {
    const before = await maxId('external_media_ref');

    await app.get(MediaBackfillService).run();

    expect(await maxId('external_media_ref')).toBe(before);
  }, 120_000);
});
