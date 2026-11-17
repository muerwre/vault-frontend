process.env.GOOGLE_API_KEY = '';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { MediaJobsService } from '../src/modules/media/media-jobs.service';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zv${stamp}ad${n}`.padEnd(11, 'q');

describe('media admin API (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;
  let adminId: number;
  let userId: number;
  const mediaIds: number[] = [];

  const makeUser = async (role: 'user' | 'admin') => {
    const username = `maspec_${role}_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`, role],
    );
    return Number(
      (await db.query('SELECT id FROM user WHERE username = ?', [username]))[0]
        .id,
    );
  };

  /** An item with one job in the given state; returns the job id. */
  const jobIn = async (
    externalId: string,
    status: string,
    fields: {
      attempts?: number;
      lastError?: string;
      videoStatus?: string;
    } = {},
  ) => {
    await db.query(
      `INSERT INTO external_media (provider, external_id, kind, video_status, duration)
       VALUES ('youtube', ?, 'video', ?, 120)`,
      [externalId, fields.videoStatus ?? 'failed'],
    );
    const mediaId = Number(
      (await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id,
    );
    mediaIds.push(mediaId);

    await db.query(
      `INSERT INTO media_job (kind, media_id, status, attempts, last_error, next_attempt_at, payload)
       VALUES ('download', ?, ?, ?, ?, ?, '{}')`,
      [
        mediaId,
        status,
        fields.attempts ?? 0,
        fields.lastError ?? null,
        status === 'queued' ? new Date(Date.now() + 3600_000) : null,
      ],
    );

    return Number((await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id);
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    adminId = await makeUser('admin');
    userId = await makeUser('user');
  });

  afterAll(async () => {
    if (mediaIds.length > 0) {
      await db.query('DELETE FROM external_media_ref WHERE media_id IN (?)', [
        mediaIds,
      ]);
      await db.query('DELETE FROM media_job WHERE media_id IN (?)', [mediaIds]);
      await db.query('DELETE FROM external_media WHERE id IN (?)', [mediaIds]);
    }
    await db.query('DELETE FROM user WHERE id IN (?)', [[adminId, userId]]);
    await app.close();
  });

  describe('access', () => {
    it.each([
      ['a guest', {}],
      ['a user', 'user'],
      ['a user whose token claims admin', 'forged'],
    ])('answers 404 to %s', async (_who, as) => {
      const headers =
        as === 'user'
          ? authHeader(userId)
          : as === 'forged'
            ? authHeader(userId, 'admin')
            : {};

      await http().get('/api/admin/media/summary').set(headers).expect(404);
      await http().get('/api/admin/media/jobs').set(headers).expect(404);
      await http()
        .post('/api/admin/media/jobs/1/retry')
        .set(headers)
        .expect(404);
    });
  });

  describe('summary', () => {
    it('counts items, jobs and storage, and lists fetchers and settings', async () => {
      await jobIn(vid(1), 'failed', { lastError: 'ERROR: x' });
      app.get(MediaJobsService).fetchers.set('home', {
        version: '2026.10.26',
        lastSeenAt: new Date(),
      });

      const { body } = await http()
        .get('/api/admin/media/summary')
        .set(authHeader(adminId, 'admin'))
        .expect(200);

      expect(body).toMatchObject({
        enabled: expect.any(Boolean),
        items: expect.objectContaining({ failed: expect.any(Number) }),
        thumbs: expect.any(Object),
        backlog_waiting: expect.any(Number),
        retrying: expect.any(Number),
        storage: { files: expect.any(Number), bytes: expect.any(Number) },
        fetchers: [
          {
            name: 'home',
            yt_dlp_version: '2026.10.26',
            last_seen_at: expect.any(String),
          },
        ],
        settings: {
          fetcher_keys: expect.any(Number),
          quality_tiers: '≤30 min: 720p, ≤60 min: 480p, ≤90 min: 360p',
          max_duration_sec: expect.any(Number),
          max_mb: expect.any(Number),
          backlog_batch: expect.any(Number),
          backlog_cron: expect.any(String),
          rescan_cron: expect.any(String),
          cleanup_cron: expect.any(String),
          grace_days: expect.any(Number),
          time_zone: expect.any(String),
        },
      });
      expect(body.jobs).toContainEqual({
        kind: 'download',
        status: 'failed',
        count: expect.any(Number),
      });
    });
  });

  describe('jobs', () => {
    let failedId: number;
    let retryingId: number;

    beforeAll(async () => {
      failedId = await jobIn(vid(2), 'failed', {
        attempts: 0,
        lastError: 'ERROR: [youtube] x: Private video',
        videoStatus: 'unavailable',
      });
      retryingId = await jobIn(vid(3), 'queued', {
        attempts: 2,
        lastError: 'bot check',
      });
    });

    it('lists failed jobs, with their item', async () => {
      const { body } = await http()
        .get('/api/admin/media/jobs?status=failed')
        .set(authHeader(adminId, 'admin'))
        .expect(200);

      const job = body.jobs.find((row: { id: number }) => row.id === failedId);

      expect(body.total).toBeGreaterThanOrEqual(1);
      expect(job).toMatchObject({
        kind: 'download',
        status: 'failed',
        last_error: 'ERROR: [youtube] x: Private video',
        media: {
          provider: 'youtube',
          external_id: vid(2),
          video_status: 'unavailable',
          duration: 120,
        },
      });
      expect(
        body.jobs.every((row: { status: string }) => row.status === 'failed'),
      ).toBe(true);
    });

    it('lists the queue by default: running, due, retrying, backlog, then cancelled', async () => {
      const cancelledId = await jobIn(vid(8), 'cancelled');
      const dueId = await jobIn(vid(9), 'queued');
      await db.query(
        'UPDATE media_job SET next_attempt_at = NULL WHERE id = ?',
        [dueId],
      );
      const runningId = await jobIn(vid(10), 'running');

      await db.query(
        `INSERT INTO external_media (provider, external_id, kind, video_status, priority, duration)
         VALUES ('youtube', ?, 'video', 'none', 10, 60)`,
        [vid(11)],
      );
      const backlogId = Number(
        (await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id,
      );
      mediaIds.push(backlogId);
      await db.query(
        `INSERT INTO external_media_ref (media_id, owner_type, owner_id) VALUES (?, 'node', 0)`,
        [backlogId],
      );

      const { body } = await http()
        .get('/api/admin/media/jobs?take=100')
        .set(authHeader(adminId, 'admin'))
        .expect(200);

      const keys = (body.jobs as Array<{ id: number; status: string }>).map(
        (row) => `${row.status === 'backlog' ? 'b' : 'j'}${row.id}`,
      );
      const mine = keys.filter((key) =>
        [
          `j${runningId}`,
          `j${dueId}`,
          `j${retryingId}`,
          `b${backlogId}`,
          `j${cancelledId}`,
        ].includes(key),
      );

      expect(mine).toEqual([
        `j${runningId}`,
        `j${dueId}`,
        `j${retryingId}`,
        `b${backlogId}`,
        `j${cancelledId}`,
      ]);
      expect(keys).not.toContain(`j${failedId}`);
      expect(
        body.jobs.find(
          (row: { id: number; status: string }) =>
            row.status === 'backlog' && row.id === backlogId,
        ),
      ).toMatchObject({
        attempts: 0,
        media: { external_id: vid(11), video_status: 'none' },
      });
    });

    it('pages through the queue across jobs and backlog alike', async () => {
      const key = (row: { id: number; status: string }) =>
        `${row.status}:${row.id}`;
      const all = await http()
        .get('/api/admin/media/jobs?take=100')
        .set(authHeader(adminId, 'admin'))
        .expect(200);

      const paged: string[] = [];
      for (let skip = 0; skip < all.body.total; skip += 2) {
        const page = await http()
          .get(`/api/admin/media/jobs?take=2&skip=${skip}`)
          .set(authHeader(adminId, 'admin'))
          .expect(200);

        expect(page.body.total).toBe(all.body.total);
        paged.push(...page.body.jobs.map(key));
      }

      expect(paged).toEqual(all.body.jobs.map(key));
    });

    it('refuses unknown filters', async () => {
      await http()
        .get('/api/admin/media/jobs?status=retrying')
        .set(authHeader(adminId, 'admin'))
        .expect(400);
    });

    it('puts a failed job back in the queue, due at once', async () => {
      await http()
        .post(`/api/admin/media/jobs/${failedId}/retry`)
        .set(authHeader(adminId, 'admin'))
        .expect(204);

      const [job] = await db.query('SELECT * FROM media_job WHERE id = ?', [
        failedId,
      ]);
      expect(job).toMatchObject({
        status: 'queued',
        next_attempt_at: null,
        finished_at: null,
      });

      const [item] = await db.query(
        'SELECT video_status FROM external_media WHERE external_id = ?',
        [vid(2)],
      );
      expect(item.video_status).toBe('queued');
    });

    it('will not retry a finished job, nor one whose copy is ready or removed', async () => {
      const done = await jobIn(vid(5), 'done', { videoStatus: 'ready' });
      const cancelledReady = await jobIn(vid(6), 'cancelled', {
        videoStatus: 'ready',
      });
      const cancelledRemoved = await jobIn(vid(7), 'cancelled', {
        videoStatus: 'removed',
      });

      for (const id of [done, cancelledReady, cancelledRemoved]) {
        await http()
          .post(`/api/admin/media/jobs/${id}/retry`)
          .set(authHeader(adminId, 'admin'))
          .expect(409);
      }

      const [item] = await db.query(
        'SELECT video_status FROM external_media WHERE external_id = ?',
        [vid(6)],
      );
      expect(item.video_status).toBe('ready');
    });

    it('will not retry a job a fetcher is working on, or one that does not exist', async () => {
      const runningId = await jobIn(vid(4), 'running');

      await http()
        .post(`/api/admin/media/jobs/${runningId}/retry`)
        .set(authHeader(adminId, 'admin'))
        .expect(409);
      await http()
        .post('/api/admin/media/jobs/999999999/retry')
        .set(authHeader(adminId, 'admin'))
        .expect(404);
    });
  });
});
