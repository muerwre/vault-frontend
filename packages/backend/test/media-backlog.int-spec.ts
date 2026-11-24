process.env.GOOGLE_API_KEY = '';
process.env.CACHE_YOUTUBE_THUMBS = 'false';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { DataSource } from 'typeorm';

import { MediaPlannerService } from '../src/modules/media/media-planner.service';

import { createTestApp, getDataSource } from './helpers/app';

const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zu${stamp}bl${n}`.padEnd(11, 'q');

/**
 * The backlog's release order, against the real query. Waiting items that
 * existed before are parked as `removed` for the duration and put back after.
 */
describe('media backlog release (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let userId: number;
  const nodeIds: number[] = [];
  const commentIds: number[] = [];
  const mediaIds: number[] = [];
  let parked: Array<{ id: number }> = [];
  let parkedJobs: Array<{ id: number }> = [];

  const lastId = async () =>
    Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);

  const node = async (daysAgo: number) => {
    await db.query(
      `INSERT INTO node (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
                         created_at, updated_at, userId)
       VALUES ('backlog spec', 'video', '[]', '', 1, 1, 0,
               NOW() - INTERVAL ? DAY, NOW(), ?)`,
      [daysAgo, userId],
    );
    const id = await lastId();
    nodeIds.push(id);
    return id;
  };

  const comment = async (nodeId: number, daysAgo: number) => {
    await db.query(
      `INSERT INTO comment (text, files_order, nodeId, userId, created_at, updated_at)
       VALUES ('backlog spec', '', ?, ?, NOW() - INTERVAL ? DAY, NOW())`,
      [nodeId, userId, daysAgo],
    );
    const id = await lastId();
    commentIds.push(id);
    return id;
  };

  /** A waiting backlog item linked from one node or comment. */
  const waiting = async (
    externalId: string,
    ownerType: 'node' | 'comment',
    ownerId: number,
  ) => {
    await db.query(
      `INSERT INTO external_media (provider, external_id, video_status, priority)
       VALUES ('youtube', ?, 'none', 10)`,
      [externalId],
    );
    const mediaId = await lastId();
    mediaIds.push(mediaId);
    await db.query(
      'INSERT INTO external_media_ref (media_id, owner_type, owner_id) VALUES (?, ?, ?)',
      [mediaId, ownerType, ownerId],
    );
  };

  const statusOf = async (externalId: string) =>
    (
      await db.query(
        `SELECT video_status FROM external_media WHERE provider = 'youtube' AND external_id = ?`,
        [externalId],
      )
    )[0].video_status;

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);

    parked = await db.query(
      `SELECT id FROM external_media WHERE video_status = 'none' AND priority > 0`,
    );
    if (parked.length > 0) {
      await db.query(
        `UPDATE external_media SET video_status = 'removed' WHERE id IN (?)`,
        [parked.map((row) => row.id)],
      );
    }

    // a release waits for an empty queue, so jobs queued before step aside too
    parkedJobs = await db.query(
      `SELECT id FROM media_job WHERE status = 'queued'`,
    );
    if (parkedJobs.length > 0) {
      await db.query(
        `UPDATE media_job SET status = 'cancelled' WHERE id IN (?)`,
        [parkedJobs.map((row) => row.id)],
      );
    }

    const username = `blspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    userId = Number(
      (await db.query('SELECT id FROM user WHERE username = ?', [username]))[0]
        .id,
    );

    const ancient = await node(3000);
    await waiting(vid(1), 'node', ancient);
    await waiting(vid(2), 'node', await node(1));
    await waiting(vid(3), 'node', await node(100));
    // a fresh comment under an old node counts as fresh
    await waiting(vid(4), 'comment', await comment(ancient, 2));

    process.env.MEDIA_BACKLOG_BATCH = '2';
  });

  afterAll(async () => {
    delete process.env.MEDIA_BACKLOG_BATCH;

    await db.query('DELETE FROM media_job WHERE media_id IN (?)', [mediaIds]);
    await db.query('DELETE FROM external_media_ref WHERE media_id IN (?)', [
      mediaIds,
    ]);
    await db.query('DELETE FROM external_media WHERE id IN (?)', [mediaIds]);
    await db.query('DELETE FROM comment WHERE id IN (?)', [commentIds]);
    await db.query('DELETE FROM node WHERE id IN (?)', [nodeIds]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);

    if (parked.length > 0) {
      await db.query(
        `UPDATE external_media SET video_status = 'none' WHERE id IN (?)`,
        [parked.map((row) => row.id)],
      );
    }

    if (parkedJobs.length > 0) {
      await db.query(`UPDATE media_job SET status = 'queued' WHERE id IN (?)`, [
        parkedJobs.map((row) => row.id),
      ]);
    }

    await app.close();
  });

  it('releases what the most recent content links first', async () => {
    await app.get(MediaPlannerService).releaseBacklog();

    expect({
      day1node: await statusOf(vid(2)),
      day2comment: await statusOf(vid(4)),
      day100node: await statusOf(vid(3)),
      year2018node: await statusOf(vid(1)),
    }).toEqual({
      day1node: 'queued',
      day2comment: 'queued',
      day100node: 'none',
      year2018node: 'none',
    });
  });

  it('holds the next release while the queue still has work', async () => {
    await app.get(MediaPlannerService).releaseBacklog();

    expect(await statusOf(vid(3))).toBe('none');
    expect(await statusOf(vid(1))).toBe('none');
  });

  it('carries on with the next newest once the queue has emptied', async () => {
    await db.query(
      `UPDATE media_job SET status = 'done' WHERE media_id IN (?) AND status = 'queued'`,
      [mediaIds],
    );

    await app.get(MediaPlannerService).releaseBacklog();

    expect(await statusOf(vid(3))).toBe('queued');
    expect(await statusOf(vid(1))).toBe('queued');
  });
});
