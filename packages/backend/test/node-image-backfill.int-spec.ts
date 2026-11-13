import { mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Files for this spec live in their own uploads root, set before the app reads
// its configuration.
const UPLOAD_ROOT = mkdtempSync(join(tmpdir(), 'vault-backfill-spec-'));
process.env.UPLOADS_PATH = UPLOAD_ROOT;

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import sharp from 'sharp';
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
import { deleteFiles, makeFile, readFile } from './helpers/fixtures';

describe('image metadata backfill on node read (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;
  let mark: DispatchWatermark;
  let userId: number;
  const fileIds: number[] = [];
  const nodeIds: number[] = [];

  /** An image row whose bytes exist on disk, with the given stored metadata. */
  const imageOnDisk = async (metadata: Record<string, unknown>) => {
    const id = await makeFile(db, userId, 'image', { metadata });
    fileIds.push(id);
    const [row] = await db.query('SELECT full_path FROM file WHERE id = ?', [
      id,
    ]);

    mkdirSync(join(UPLOAD_ROOT, 'uploads', 'spec'), { recursive: true });
    writeFileSync(
      join(UPLOAD_ROOT, row.full_path),
      await sharp({
        create: {
          width: 40,
          height: 30,
          channels: 3,
          background: { r: 18, g: 52, b: 86 },
        },
      })
        .png()
        .toBuffer(),
    );
    await db.query("UPDATE file SET mime = 'image/png' WHERE id = ?", [id]);

    return id;
  };

  const imageNode = async (fileId: number) => {
    const { body } = await http()
      .post('/api/nodes/')
      .set(authHeader(userId))
      .send({ type: 'image', title: 'backfill', files: [{ id: fileId }] })
      .expect(200);
    nodeIds.push(Number(body.node.id));

    return Number(body.node.id);
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());
    mark = await notificationWatermark(db);

    const username = `bfspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    userId = Number(row.id);
  });

  afterAll(async () => {
    await clearNotificationsAbove(db, mark);
    for (const id of nodeIds) {
      await db.query('DELETE FROM node_files_file WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    await deleteFiles(db, fileIds);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  it('fills in and saves missing dimensions and colour when the node is read', async () => {
    const fileId = await imageOnDisk({});
    const nodeId = await imageNode(fileId);

    const { body } = await http().get(`/api/nodes/${nodeId}`).expect(200);

    const expected = { width: 40, height: 30, dominant_color: '#123456' };
    expect(body.node.files[0].metadata).toMatchObject(expected);
    expect((await readFile(db, fileId)).metadata).toMatchObject(expected);
  });

  it('fills in a missing colour while keeping what is there', async () => {
    const fileId = await imageOnDisk({ width: 40, height: 30, title: 'kept' });
    const nodeId = await imageNode(fileId);

    await http().get(`/api/nodes/${nodeId}`).expect(200);

    expect((await readFile(db, fileId)).metadata).toMatchObject({
      title: 'kept',
      dominant_color: '#123456',
    });
  });

  it('leaves complete metadata alone', async () => {
    const complete = { width: 1, height: 2, dominant_color: '#ABCDEF' };
    const fileId = await imageOnDisk(complete);
    const nodeId = await imageNode(fileId);

    await http().get(`/api/nodes/${nodeId}`).expect(200);

    expect((await readFile(db, fileId)).metadata).toEqual(complete);
  });

  it('serves the node when the image is missing on disk', async () => {
    const fileId = await makeFile(db, userId, 'image', { metadata: {} });
    fileIds.push(fileId);
    await db.query("UPDATE file SET mime = 'image/png' WHERE id = ?", [fileId]);
    const nodeId = await imageNode(fileId);

    await http().get(`/api/nodes/${nodeId}`).expect(200);

    expect((await readFile(db, fileId)).metadata).toEqual({});
  });
});
