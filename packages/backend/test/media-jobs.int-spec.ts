import { createHash } from 'crypto';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { PassThrough } from 'stream';

// Uploads land in a throwaway directory; nothing here reaches YouTube.
const uploadsRoot = mkdtempSync(join(tmpdir(), 'media-jobs-'));
process.env.UPLOADS_PATH = uploadsRoot;
process.env.GOOGLE_API_KEY = '';
process.env.CACHE_YOUTUBE_THUMBS = 'false';
process.env.MEDIA_FETCHER_KEYS = 'home:home-secret,vps:vps-secret';

import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { MediaJobsService } from '../src/modules/media/media-jobs.service';

import { createTestApp, getDataSource } from './helpers/app';

const stamp = Date.now().toString(36).slice(-5);
const vid = (n: number) => `zx${stamp}jb${n}`.padEnd(11, 'q');

const HOUR = 60 * 60 * 1000;

const sha = (body: Buffer) => createHash('sha256').update(body).digest('hex');

describe('media jobs API (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  const mediaIds: number[] = [];
  const fileIds: number[] = [];
  /** Queued jobs that existed before, held back so specs claim only their own. */
  let parked: Array<{ id: number; next_attempt_at: Date | null }> = [];

  const as = (key: string) => ({ Authorization: `Bearer ${key}` });
  const HOME = as('home-secret');
  const VPS = as('vps-secret');

  const claim = (auth = HOME, kinds: string[] = ['download']) =>
    http().post('/api/internal/media/jobs/claim').set(auth).send({ kinds });

  /** A planned item with a queued download job; returns both ids. */
  const queueDownload = async (externalId: string, priority = 0) => {
    await db.query(
      `INSERT INTO external_media (provider, external_id, kind, video_status, priority)
       VALUES ('youtube', ?, 'video', 'queued', ?)`,
      [externalId, priority],
    );
    const mediaId = Number(
      (await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id,
    );
    mediaIds.push(mediaId);

    await db.query(
      `INSERT INTO media_job (kind, media_id, priority, payload) VALUES ('download', ?, ?, '{}')`,
      [mediaId, priority],
    );
    const jobId = Number(
      (await db.query('SELECT LAST_INSERT_ID() AS id'))[0].id,
    );

    return { mediaId, jobId };
  };

  const job = async (id: number) =>
    (await db.query('SELECT * FROM media_job WHERE id = ?', [id]))[0];

  const media = async (id: number) =>
    (await db.query('SELECT * FROM external_media WHERE id = ?', [id]))[0];

  const upload = (
    jobId: number,
    slot: string,
    body: Buffer,
    options: {
      auth?: Record<string, string>;
      mime?: string;
      hash?: string;
    } = {},
  ) =>
    http()
      .put(`/api/internal/media/jobs/${jobId}/files/${slot}`)
      .set(options.auth ?? HOME)
      .set(
        'Content-Type',
        options.mime ?? (slot === 'video' ? 'video/mp4' : 'image/jpeg'),
      )
      .set('X-Sha256', options.hash ?? sha(body))
      .send(body);

  const report = (
    jobId: number,
    action: string,
    body: object,
    auth: Record<string, string> = HOME,
  ) =>
    http()
      .post(`/api/internal/media/jobs/${jobId}/${action}`)
      .set(auth)
      .send(body);

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    process.env.CACHE_EXTERNAL_MEDIA = 'true';

    parked = await db.query(
      `SELECT id, next_attempt_at FROM media_job WHERE status = 'queued'`,
    );
    if (parked.length > 0) {
      await db.query(
        `UPDATE media_job SET next_attempt_at = '2099-01-01' WHERE id IN (?)`,
        [parked.map((row) => row.id)],
      );
    }
  });

  afterAll(async () => {
    process.env.CACHE_EXTERNAL_MEDIA = '';

    for (const row of parked) {
      await db.query('UPDATE media_job SET next_attempt_at = ? WHERE id = ?', [
        row.next_attempt_at,
        row.id,
      ]);
    }

    if (mediaIds.length > 0) {
      const files = (await db.query(
        'SELECT video_file_id FROM external_media WHERE id IN (?) AND video_file_id IS NOT NULL',
        [mediaIds],
      )) as Array<{ video_file_id: number }>;
      fileIds.push(...files.map((row) => row.video_file_id));

      await db.query('DELETE FROM media_job WHERE media_id IN (?)', [mediaIds]);
      await db.query('DELETE FROM external_media WHERE id IN (?)', [mediaIds]);
    }

    if (fileIds.length > 0) {
      await db.query('DELETE FROM file WHERE id IN (?)', [fileIds]);
    }

    rmSync(uploadsRoot, { recursive: true, force: true });
    await app.close();
  });

  describe('access', () => {
    it('refuses requests without a key or with a wrong one', async () => {
      await http()
        .post('/api/internal/media/jobs/claim')
        .send({ kinds: ['download'] })
        .expect(401);
      await claim(as('guess')).expect(401);
    });

    it('refuses unknown kinds', async () => {
      await claim(HOME, ['mine-bitcoin']).expect(400);
      await claim(HOME, []).expect(400);
    });

    it('answers 204 when there is nothing to do', async () => {
      await claim().expect(204);
    });

    it('answers 204 while the cache is off', async () => {
      await queueDownload(vid(9));
      process.env.CACHE_EXTERNAL_MEDIA = 'false';

      try {
        await claim().expect(204);
      } finally {
        process.env.CACHE_EXTERNAL_MEDIA = 'true';
      }

      // Taken out of the way of the other specs.
      await db.query(
        `UPDATE media_job SET status = 'cancelled' WHERE media_id = ?`,
        [mediaIds[mediaIds.length - 1]],
      );
    });
  });

  describe('a successful download', () => {
    const id = vid(1);
    let ids: { mediaId: number; jobId: number };
    const video = Buffer.from('not really an mp4, but bytes are bytes');
    const cover = Buffer.from('not really a jpeg');

    beforeAll(async () => {
      ids = await queueDownload(id);
    });

    it('leases the most urgent job to one fetcher', async () => {
      const { body } = await claim().expect(200);

      expect(body).toEqual({
        id: ids.jobId,
        kind: 'download',
        provider: 'youtube',
        externalId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
        constraints: {
          maxDurationSec: 90 * 60,
          maxBytes: 500 * 1024 * 1024,
          qualityTiers: [
            { maxDurationSec: 30 * 60, maxHeight: 720 },
            { maxDurationSec: 60 * 60, maxHeight: 480 },
            { maxDurationSec: 90 * 60, maxHeight: 360 },
          ],
        },
        attempt: 1,
        leaseUntil: expect.any(String),
      });
      expect(new Date(body.leaseUntil).getTime()).toBeGreaterThan(Date.now());
      expect((await media(ids.mediaId)).video_status).toBe('downloading');

      // Nobody else gets the same job.
      await claim(VPS).expect(204);
    });

    it('takes progress only from the fetcher holding the lease', async () => {
      await report(ids.jobId, 'progress', { percent: 50 }, VPS).expect(409);
      await report(ids.jobId, 'progress', { percent: 'lots' }).expect(400);
      await report(ids.jobId, 'progress', { percent: 50 }).expect(204);

      expect((await job(ids.jobId)).progress).toBe(50);
    });

    it('refuses uploads that are corrupt, mistyped or misplaced', async () => {
      await upload(ids.jobId, 'video', video, { hash: sha(cover) }).expect(400);
      await upload(ids.jobId, 'video', video, { mime: 'video/webm' }).expect(
        400,
      );
      await upload(ids.jobId, 'subtitles', video).expect(400);
      await upload(ids.jobId, 'video', video, { auth: VPS }).expect(409);
    });

    it('refuses uploads over the size limit', async () => {
      process.env.MEDIA_MAX_MB = '1';

      try {
        await upload(ids.jobId, 'video', Buffer.alloc(2 * 1024 * 1024)).expect(
          413,
        );
      } finally {
        delete process.env.MEDIA_MAX_MB;
      }
    });

    it('accepts the video and its cover, then puts them in place on completion', async () => {
      await upload(ids.jobId, 'video', video).expect(204);
      await upload(ids.jobId, 'thumbnail', cover).expect(204);

      await report(ids.jobId, 'complete', {
        video: { duration: 212, width: 1280, height: 720 },
      }).expect(204);

      const item = await media(ids.mediaId);
      expect(item).toMatchObject({
        video_status: 'ready',
        thumb_status: 'ready',
        thumb_path: `youtube/${id}.jpg`,
        duration: 212,
        width: 1280,
        height: 720,
      });

      const [file] = await db.query('SELECT * FROM file WHERE id = ?', [
        item.video_file_id,
      ]);
      expect(file).toMatchObject({
        type: 'video',
        mime: 'video/mp4',
        target: 'external',
        full_path: `media/youtube/${id}.mp4`,
        url: `REMOTE_CURRENT://media/youtube/${id}.mp4`,
        size: video.length,
      });

      expect(existsSync(join(uploadsRoot, 'media/youtube', `${id}.mp4`))).toBe(
        true,
      );
      expect(existsSync(join(uploadsRoot, 'youtube', `${id}.jpg`))).toBe(true);
      expect(readdirSync(join(uploadsRoot, 'media/.incoming'))).toEqual([]);

      expect(await job(ids.jobId)).toMatchObject({
        status: 'done',
        progress: 100,
        lease_owner: null,
        last_error: null,
      });
    });

    it('refuses reports on a finished job', async () => {
      await report(ids.jobId, 'progress', { percent: 1 }).expect(409);
      await report(999_999_999, 'progress', { percent: 1 }).expect(404);
    });
  });

  describe('leases', () => {
    it('counts any request as hearing from the fetcher', async () => {
      const jobs = app.get(MediaJobsService);
      jobs.fetchers.delete('home');

      // even one about a job that does not exist
      await report(999_999_998, 'progress', { percent: 1 }).expect(404);

      expect(jobs.fetchers.get('home')?.lastSeenAt.getTime()).toBeGreaterThan(
        Date.now() - 5_000,
      );
    });

    it('drops an upload whose job was handed to someone else meanwhile', async () => {
      const { jobId } = await queueDownload(vid(8));
      await claim().expect(200);

      const contents = Buffer.from('a copy that arrives too late');
      const body = new PassThrough();
      const uploading = app
        .get(MediaJobsService)
        .upload('home', jobId, 'video', body, {
          contentType: 'video/mp4',
          sha256: sha(contents),
        });

      body.write(contents.subarray(0, 5));
      // the lease runs out and the job goes back to the queue mid-upload
      await db.query(
        `UPDATE media_job SET status = 'queued', lease_owner = NULL, lease_until = NULL WHERE id = ?`,
        [jobId],
      );
      body.end(contents.subarray(5));

      await expect(uploading).rejects.toMatchObject({ status: 409 });

      const row = await job(jobId);
      expect(JSON.parse(row.payload ?? '{}').uploads ?? {}).toEqual({});
      expect(row.lease_owner).toBeNull();
      expect(
        readdirSync(join(uploadsRoot, 'media/.incoming')).filter((name) =>
          name.startsWith(`${jobId}-`),
        ),
      ).toEqual([]);

      await db.query(`UPDATE media_job SET status = 'cancelled' WHERE id = ?`, [
        jobId,
      ]);
    });
  });

  describe('failures', () => {
    const due = (jobId: number) =>
      db.query(
        'UPDATE media_job SET next_attempt_at = NOW() - INTERVAL 1 MINUTE WHERE id = ?',
        [jobId],
      );

    const waitOf = async (jobId: number) =>
      new Date((await job(jobId)).next_attempt_at).getTime() - Date.now();

    it('retries after an hour, then a day, then every week', async () => {
      const { jobId, mediaId } = await queueDownload(vid(2));

      await claim().expect(200);
      await report(jobId, 'fail', {
        reason: 'HTTP 429',
        retryable: true,
      }).expect(204);

      expect(await job(jobId)).toMatchObject({
        status: 'queued',
        attempts: 1,
        last_error: 'HTTP 429',
        lease_owner: null,
      });
      expect((await media(mediaId)).video_status).toBe('failed');
      expect(await waitOf(jobId)).toBeGreaterThan(HOUR - 60_000);
      expect(await waitOf(jobId)).toBeLessThanOrEqual(HOUR);

      // Not due yet.
      await claim().expect(204);

      await due(jobId);
      expect((await claim().expect(200)).body.attempt).toBe(2);
      await report(jobId, 'fail', { reason: 'bot check', retryable: true });
      expect(await waitOf(jobId)).toBeGreaterThan(24 * HOUR - 60_000);

      await due(jobId);
      await claim().expect(200);
      await report(jobId, 'fail', { reason: 'bot check', retryable: true });
      expect(await waitOf(jobId)).toBeGreaterThan(7 * 24 * HOUR - 60_000);
      expect((await job(jobId)).attempts).toBe(3);

      await db.query(`UPDATE media_job SET status = 'cancelled' WHERE id = ?`, [
        jobId,
      ]);
    });

    it('gives up on failures that cannot change', async () => {
      const { jobId, mediaId } = await queueDownload(vid(3));

      await claim().expect(200);
      await report(jobId, 'fail', {
        reason: 'Video unavailable',
        retryable: false,
      }).expect(204);

      expect((await job(jobId)).status).toBe('failed');
      expect((await media(mediaId)).video_status).toBe('unavailable');
    });

    it('records why a video was skipped', async () => {
      const { jobId, mediaId } = await queueDownload(vid(4));

      await claim().expect(200);
      await report(jobId, 'skip', { reason: 'boring' }).expect(400);
      await report(jobId, 'skip', {
        reason: 'too_big',
        duration: 1500,
        estimatedBytes: 900_000_000,
      }).expect(204);

      expect(await media(mediaId)).toMatchObject({
        video_status: 'skipped',
        skip_reason: 'too_big',
        duration: 1500,
        estimated_bytes: '900000000',
      });
      expect((await job(jobId)).status).toBe('done');
    });

    it('takes a job back from a fetcher that stopped reporting', async () => {
      const { jobId } = await queueDownload(vid(5));

      await claim().expect(200);
      await db.query(
        'UPDATE media_job SET lease_until = NOW() - INTERVAL 1 MINUTE WHERE id = ?',
        [jobId],
      );

      // Any claim sweeps expired leases first.
      await claim(VPS).expect(204);

      expect(await job(jobId)).toMatchObject({
        status: 'queued',
        attempts: 1,
        last_error: 'lease expired',
      });
      await report(jobId, 'progress', { percent: 10 }).expect(409);
    });

    it('serves the most urgent job first', async () => {
      const later = await queueDownload(vid(6), 10);
      const sooner = await queueDownload(vid(7), 0);

      expect((await claim().expect(200)).body.id).toBe(sooner.jobId);
      expect((await claim().expect(200)).body.id).toBe(later.jobId);
    });
  });
});
