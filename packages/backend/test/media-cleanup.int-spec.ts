import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';

const uploadsRoot = mkdtempSync(join(tmpdir(), 'media-cleanup-'));
process.env.UPLOADS_PATH = uploadsRoot;
process.env.GOOGLE_API_KEY = '';
process.env.CACHE_YOUTUBE_THUMBS = 'false';
process.env.MEDIA_GC_GRACE_DAYS = '1';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { DataSource } from 'typeorm';

import { MediaCleanupService } from '../src/modules/media/media-cleanup.service';

import { createTestApp, getDataSource } from './helpers/app';

const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zw${stamp}gc${n}`.padEnd(11, 'q');

const DAY = 24 * 60 * 60 * 1000;

describe('media cleanup (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let userId: number;
  const nodeIds: number[] = [];
  const commentIds: number[] = [];
  const mediaIds: number[] = [];
  const fileIds: number[] = [];
  /** Items that existed before, kept out of this spec's way. */
  let parked: Array<{ id: number; video_status: string }> = [];

  const lastId = async () =>
    Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);

  const node = async (deletedAgoMs?: number) => {
    await db.query(
      `INSERT INTO node (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
                         created_at, updated_at, deleted_at, userId)
       VALUES ('gc spec', 'video', '[]', '', 1, 1, 0, NOW(), NOW(), ?, ?)`,
      [
        deletedAgoMs === undefined ? null : new Date(Date.now() - deletedAgoMs),
        userId,
      ],
    );
    const id = await lastId();
    nodeIds.push(id);
    return id;
  };

  const comment = async (nodeId: number, deletedAgoMs?: number) => {
    await db.query(
      `INSERT INTO comment (text, files_order, nodeId, userId, created_at, updated_at, deleted_at)
       VALUES ('gc spec', '', ?, ?, NOW(), NOW(), ?)`,
      [
        nodeId,
        userId,
        deletedAgoMs === undefined ? null : new Date(Date.now() - deletedAgoMs),
      ],
    );
    const id = await lastId();
    commentIds.push(id);
    return id;
  };

  const writeUpload = (relative: string) => {
    const absolute = join(uploadsRoot, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, 'bytes');
    return absolute;
  };

  /** A downloaded item: video file row and files on disk, with a queued job. */
  const item = async (externalId: string) => {
    const videoPath = `media/youtube/${externalId}.mp4`;
    const thumbPath = `youtube/${externalId}.jpg`;
    writeUpload(videoPath);
    writeUpload(thumbPath);

    await db.query(
      `INSERT INTO file (name, orig_name, path, full_path, url, size, type, mime, target, created_at, updated_at)
       VALUES (?, ?, 'media/youtube', ?, ?, 5, 'video', 'video/mp4', 'external', NOW(), NOW())`,
      [
        `${externalId}.mp4`,
        `${externalId}.mp4`,
        videoPath,
        `REMOTE_CURRENT://${videoPath}`,
      ],
    );
    const fileId = await lastId();
    fileIds.push(fileId);

    await db.query(
      `INSERT INTO external_media (provider, external_id, kind, video_status, thumb_status, video_file_id, thumb_path)
       VALUES ('youtube', ?, 'video', 'ready', 'ready', ?, ?)`,
      [externalId, fileId, thumbPath],
    );
    const mediaId = await lastId();
    mediaIds.push(mediaId);

    await db.query(
      `INSERT INTO media_job (kind, media_id, status, payload) VALUES ('download', ?, 'queued', '{}')`,
      [mediaId],
    );

    return { mediaId, fileId, videoPath, thumbPath };
  };

  const link = (
    mediaId: number,
    ownerType: 'node' | 'comment',
    ownerId: number,
  ) =>
    db.query(
      'INSERT INTO external_media_ref (media_id, owner_type, owner_id) VALUES (?, ?, ?)',
      [mediaId, ownerType, ownerId],
    );

  const statusOf = async (mediaId: number) =>
    (await db.query('SELECT * FROM external_media WHERE id = ?', [mediaId]))[0];

  let cases: Record<string, Awaited<ReturnType<typeof item>>>;
  let staleUpload: string;
  let freshUpload: string;
  let report: Awaited<ReturnType<MediaCleanupService['run']>>;

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);

    parked = await db.query(
      `SELECT id, video_status FROM external_media WHERE video_status <> 'removed'`,
    );
    if (parked.length > 0) {
      await db.query(
        `UPDATE external_media SET video_status = 'removed' WHERE id IN (?)`,
        [parked.map((row) => row.id)],
      );
    }

    const username = `gcspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    userId = Number(
      (await db.query('SELECT id FROM user WHERE username = ?', [username]))[0]
        .id,
    );

    const liveNode = await node();
    const longDeletedNode = await node(2 * DAY);
    const recentlyDeletedNode = await node(60 * 60 * 1000);

    cases = {
      live: await item(vid(1)),
      longDeleted: await item(vid(2)),
      recentlyDeleted: await item(vid(3)),
      commentUnderDeletedNode: await item(vid(4)),
      deletedComment: await item(vid(5)),
      erasedOwner: await item(vid(6)),
      shared: await item(vid(7)),
    };

    await link(cases.live.mediaId, 'node', liveNode);
    await link(cases.longDeleted.mediaId, 'node', longDeletedNode);
    await link(cases.recentlyDeleted.mediaId, 'node', recentlyDeletedNode);
    await link(
      cases.commentUnderDeletedNode.mediaId,
      'comment',
      await comment(longDeletedNode),
    );
    await link(
      cases.deletedComment.mediaId,
      'comment',
      await comment(liveNode, 2 * DAY),
    );
    await link(cases.erasedOwner.mediaId, 'node', 2_000_000_000);
    await link(cases.shared.mediaId, 'node', longDeletedNode);
    await link(cases.shared.mediaId, 'comment', await comment(liveNode));

    staleUpload = writeUpload('media/.incoming/1-video-stale');
    const twoDaysAgo = (Date.now() - 2 * DAY) / 1000;
    utimesSync(staleUpload, twoDaysAgo, twoDaysAgo);
    freshUpload = writeUpload('media/.incoming/2-video-fresh');

    report = await app.get(MediaCleanupService).run();
  });

  afterAll(async () => {
    await db.query('DELETE FROM media_job WHERE media_id IN (?)', [mediaIds]);
    await db.query('DELETE FROM external_media_ref WHERE media_id IN (?)', [
      mediaIds,
    ]);
    await db.query('DELETE FROM external_media WHERE id IN (?)', [mediaIds]);
    await db.query('DELETE FROM file WHERE id IN (?)', [fileIds]);
    await db.query('DELETE FROM comment WHERE id IN (?)', [commentIds]);
    await db.query('DELETE FROM node WHERE id IN (?)', [nodeIds]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);

    for (const row of parked) {
      await db.query(
        'UPDATE external_media SET video_status = ? WHERE id = ?',
        [row.video_status, row.id],
      );
    }

    rmSync(uploadsRoot, { recursive: true, force: true });
    await app.close();
  });

  const expectRemoved = async (key: string) => {
    const { mediaId, fileId, videoPath, thumbPath } = cases[key];

    expect(await statusOf(mediaId)).toMatchObject({
      video_status: 'removed',
      video_file_id: null,
      thumb_status: 'none',
      thumb_path: null,
    });
    expect(existsSync(join(uploadsRoot, videoPath))).toBe(false);
    expect(existsSync(join(uploadsRoot, thumbPath))).toBe(false);

    const [file] = await db.query('SELECT deleted_at FROM file WHERE id = ?', [
      fileId,
    ]);
    expect(file.deleted_at).not.toBeNull();

    const [jobRow] = await db.query(
      'SELECT status FROM media_job WHERE media_id = ?',
      [mediaId],
    );
    expect(jobRow.status).toBe('cancelled');
  };

  const expectKept = async (key: string) => {
    const { mediaId, videoPath } = cases[key];

    expect((await statusOf(mediaId)).video_status).toBe('ready');
    expect(existsSync(join(uploadsRoot, videoPath))).toBe(true);
  };

  it('keeps what a live node or comment links', async () => {
    await expectKept('live');
    await expectKept('shared');
  });

  it('keeps the videos of something deleted within the grace period', async () => {
    await expectKept('recentlyDeleted');
  });

  it('removes what only deleted content links, files included', async () => {
    await expectRemoved('longDeleted');
    await expectRemoved('deletedComment');
  });

  it('treats a live comment under a deleted node as deleted', async () => {
    await expectRemoved('commentUnderDeletedNode');
  });

  it('drops links to erased content and removes what they held', async () => {
    const refs = await db.query(
      'SELECT * FROM external_media_ref WHERE media_id = ?',
      [cases.erasedOwner.mediaId],
    );

    expect(refs).toEqual([]);
    await expectRemoved('erasedOwner');
    expect(report.linksDropped).toBeGreaterThanOrEqual(1);
  });

  it('clears abandoned uploads only', () => {
    expect(existsSync(staleUpload)).toBe(false);
    expect(existsSync(freshUpload)).toBe(true);
    expect(report.incomingDeleted).toBe(1);
  });

  it('reports what it did', () => {
    expect(report.removed).toBe(4);
  });

  it('leaves removed items alone on the next run', async () => {
    const again = await app.get(MediaCleanupService).run();

    expect(again.removed).toBe(0);
  });
});
