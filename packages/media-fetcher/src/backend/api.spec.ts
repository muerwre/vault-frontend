import { createHash } from 'crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { createServer, type IncomingMessage, type Server } from 'http';
import type { AddressInfo } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';

import { BackendClient, BackendError } from './api';

interface Seen {
  method: string;
  url: string;
  headers: IncomingMessage['headers'];
  body: Buffer;
}

/** A stand-in backend answering each request with the next queued reply. */
describe('BackendClient', () => {
  let server: Server;
  let base: string;
  let seen: Seen[];
  let replies: Array<{ status: number; json?: unknown }>;
  const dir = mkdtempSync(join(tmpdir(), 'fetcher-api-'));

  beforeAll(async () => {
    server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        seen.push({
          method: request.method ?? '',
          url: request.url ?? '',
          headers: request.headers,
          body: Buffer.concat(chunks),
        });
        const reply = replies.shift() ?? { status: 204 };
        response.statusCode = reply.status;
        if (reply.json !== undefined) {
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify(reply.json));
        } else {
          response.end();
        }
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  });

  beforeEach(() => {
    seen = [];
    replies = [];
  });

  afterAll(async () => {
    rmSync(dir, { recursive: true, force: true });
    await new Promise((resolve) => server.close(resolve));
  });

  const client = () => new BackendClient(base, 'the-key');

  it('claims with its key, kinds and yt-dlp version', async () => {
    const job = { id: 7, kind: 'download' };
    replies.push({ status: 200, json: job });

    await expect(client().claim(['download'], '2026.10.01')).resolves.toEqual(
      job,
    );
    expect(seen[0]).toMatchObject({
      method: 'POST',
      url: '/api/internal/media/jobs/claim',
    });
    expect(seen[0].headers.authorization).toBe('Bearer the-key');
    expect(JSON.parse(seen[0].body.toString())).toEqual({
      kinds: ['download'],
      ytDlpVersion: '2026.10.01',
    });
  });

  it('reads 204 as no job', async () => {
    replies.push({ status: 204 });

    await expect(client().claim(['download'])).resolves.toBeNull();
  });

  it('streams an upload with its size and checksum', async () => {
    const contents = Buffer.alloc(3 * 1024 * 1024, 7);
    const path = join(dir, 'video.mp4');
    writeFileSync(path, contents);

    await client().upload(7, 'video', path, 'video/mp4');

    expect(seen[0]).toMatchObject({
      method: 'PUT',
      url: '/api/internal/media/jobs/7/files/video',
    });
    expect(seen[0].headers['content-type']).toBe('video/mp4');
    expect(seen[0].headers['content-length']).toBe(String(contents.length));
    expect(seen[0].headers['x-sha256']).toBe(
      createHash('sha256').update(contents).digest('hex'),
    );
    expect(seen[0].body.equals(contents)).toBe(true);
  });

  it('sends reports to the job’s own routes', async () => {
    await client().progress(7, 50, 'download');
    await client().complete(7, { video: { duration: 10 } });
    await client().fail(7, { reason: 'x', retryable: true });
    await client().skip(7, { reason: 'too_long', duration: 4000 });

    expect(seen.map((request) => request.url)).toEqual([
      '/api/internal/media/jobs/7/progress',
      '/api/internal/media/jobs/7/complete',
      '/api/internal/media/jobs/7/fail',
      '/api/internal/media/jobs/7/skip',
    ]);
    expect(JSON.parse(seen[0].body.toString())).toEqual({
      percent: 50,
      stage: 'download',
    });
  });

  it('turns error answers into BackendError, telling a lost job apart', async () => {
    replies.push({ status: 409 }, { status: 500 });

    const lost = await client()
      .progress(7, 1)
      .catch((error) => error);
    const broken = await client()
      .progress(7, 1)
      .catch((error) => error);

    expect(lost).toBeInstanceOf(BackendError);
    expect(lost.lostJob).toBe(true);
    expect(broken.status).toBe(500);
    expect(broken.lostJob).toBe(false);
  });
});
