import { mkdtempSync } from 'fs';
import { readFile, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// Point uploads at a scratch directory before anything reads the config.
const UPLOAD_ROOT = mkdtempSync(join(tmpdir(), 'vault-upload-spec-'));
process.env.UPLOADS_PATH = UPLOAD_ROOT;
process.env.UPLOADS_OUTPUT_WEBP = 'false';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import sharp from 'sharp';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource } from './helpers/app';

const SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="#f00"/></svg>';

describe('upload and static (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let userId: number;
  const fileIds: number[] = [];

  /** A solid-colour PNG, so the dominant colour is predictable. */
  const png = (width = 40, height = 30, colour = { r: 18, g: 52, b: 86 }) =>
    sharp({
      create: { width, height, channels: 3, background: colour },
    })
      .png()
      .toBuffer();

  /**
   * A landscape JPEG tagged with EXIF orientation 6, i.e. one a camera shot in
   * portrait: stored 120x60, but meant to be displayed 60x120.
   */
  const rotatedJpeg = () =>
    sharp({
      create: {
        width: 120,
        height: 60,
        channels: 3,
        background: { r: 200, g: 30, b: 30 },
      },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

  const upload = (
    target: string,
    type: string,
    contents: Buffer,
    filename: string,
    contentType: string,
  ) =>
    http()
      .post(`/api/upload/${target}/${type}`)
      .set(authHeader(userId))
      .attach('file', contents, { filename, contentType });

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    const username = `upspec_${Date.now()}`;
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
    for (const id of fileIds) {
      await db.query('DELETE FROM file WHERE id = ?', [id]);
    }
    await db.query('DELETE FROM file WHERE userId = ?', [userId]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  describe('POST /upload/:target/:type', () => {
    it('answers 201 with the shallow file shape', async () => {
      const { body } = await upload(
        'nodes',
        'image',
        await png(),
        'pic.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      expect(Object.keys(body).sort()).toEqual([
        'id',
        'metadata',
        'mime',
        'size',
        'type',
        'url',
      ]);
    });

    it('stores the documented path scheme', async () => {
      const { body } = await upload(
        'nodes',
        'image',
        await png(),
        'pic.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      const [row] = await db.query(
        'SELECT name, orig_name, path, full_path, url FROM file WHERE id = ?',
        [body.id],
      );

      const now = new Date();
      const expectedDir = `uploads/${now.getFullYear()}/${now.getMonth() + 1}/image`;

      expect(row.path).toBe(expectedDir);
      expect(row.orig_name).toBe('pic.png');
      expect(row.name).toMatch(/^pic-\d{10}\.png$/);
      expect(row.full_path).toBe(`${expectedDir}/${row.name}`);
      expect(row.url).toBe(`REMOTE_CURRENT://${expectedDir}/${row.name}`);
    });

    it('writes the bytes to disk unchanged', async () => {
      const contents = await png();
      const { body } = await upload(
        'nodes',
        'image',
        contents,
        'exact.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      const [row] = await db.query(
        'SELECT full_path, size FROM file WHERE id = ?',
        [body.id],
      );

      const onDisk = await readFile(join(UPLOAD_ROOT, row.full_path));
      expect(onDisk.equals(contents)).toBe(true);
      expect(Number(row.size)).toBe(contents.length);
    });

    /** A fresh upload has no target until a node or comment claims it. */
    it('leaves target unset', async () => {
      const { body } = await upload(
        'nodes',
        'image',
        await png(),
        'pic.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      const [row] = await db.query('SELECT target FROM file WHERE id = ?', [
        body.id,
      ]);
      expect(row.target).toBeNull();
    });

    it('records image dimensions and a dominant colour', async () => {
      const { body } = await upload(
        'nodes',
        'image',
        await png(40, 30, { r: 18, g: 52, b: 86 }),
        'colour.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      expect(body.metadata.width).toBe(40);
      expect(body.metadata.height).toBe(30);
      expect(body.metadata.dominant_color).toBe('#123456');
    });

    it('stores an svg without raster metadata', async () => {
      const { body } = await upload(
        'nodes',
        'image',
        Buffer.from(SVG),
        'vector.svg',
        'image/svg+xml',
      ).expect(201);

      fileIds.push(body.id);
      expect(body.metadata.width).toBeUndefined();

      const [row] = await db.query('SELECT full_path FROM file WHERE id = ?', [
        body.id,
      ]);
      const onDisk = await readFile(join(UPLOAD_ROOT, row.full_path), 'utf8');
      expect(onDisk).toBe(SVG);
    });

    it('accepts an upload to every valid target', async () => {
      for (const target of ['nodes', 'comments', 'profiles', 'other']) {
        const { body } = await upload(
          target,
          'image',
          await png(),
          'pic.png',
          'image/png',
        ).expect(201);
        fileIds.push(body.id);
      }
    });

    describe('rejections', () => {
      it('400s an unknown target or type', async () => {
        await upload(
          'elsewhere',
          'image',
          await png(),
          'p.png',
          'image/png',
        ).expect(400);
        await upload(
          'nodes',
          'video',
          await png(),
          'p.png',
          'image/png',
        ).expect(400);
      });

      it('400s a mime that does not match the declared type', async () => {
        const { body } = await upload(
          'nodes',
          'audio',
          await png(),
          'p.png',
          'image/png',
        ).expect(400);

        expect(body.error).toBe('Unknown_File_Type');
      });

      it('400s an unsupported mime', async () => {
        const { body } = await upload(
          'nodes',
          'image',
          Buffer.from('nope'),
          'a.zip',
          'application/zip',
        ).expect(400);

        expect(body.error).toBe('Unknown_File_Type');
      });

      it('400s a request with no file', async () => {
        const { body } = await http()
          .post('/api/upload/nodes/image')
          .set(authHeader(userId))
          .expect(400);

        expect(body.error).toBe('Files_Required');
      });

      it('401s without a token', async () => {
        await http()
          .post('/api/upload/nodes/image')
          .attach('file', await png(), {
            filename: 'p.png',
            contentType: 'image/png',
          })
          .expect(401);
      });
    });
  });

  describe('GET /static/*', () => {
    let fullPath: string;

    beforeAll(async () => {
      const { body } = await upload(
        'nodes',
        'image',
        await png(200, 100),
        'static.png',
        'image/png',
      ).expect(201);

      fileIds.push(body.id);
      const [row] = await db.query('SELECT full_path FROM file WHERE id = ?', [
        body.id,
      ]);
      fullPath = row.full_path;
    });

    it('serves an uploaded file', async () => {
      const response = await http().get(`/api/static/${fullPath}`).expect(200);

      expect(response.headers['cache-control']).toContain('max-age=');
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('404s a file that does not exist', async () => {
      await http().get('/api/static/uploads/nope/missing.png').expect(404);
    });

    /** Traversal must not escape the uploads root. */
    it('404s a traversal attempt', async () => {
      await http().get('/api/static/../../etc/passwd').expect(404);
    });

    /**
     * A camera photo carries its rotation in EXIF. Scaling drops that tag, so
     * unless the variant is physically rotated it comes out sideways while the
     * untouched original still looks right.
     */
    describe('exif orientation', () => {
      let rotatedPath: string;

      beforeAll(async () => {
        const { body } = await upload(
          'nodes',
          'image',
          await rotatedJpeg(),
          'turned.jpg',
          'image/jpeg',
        ).expect(201);

        fileIds.push(body.id);
        const [row] = await db.query(
          'SELECT full_path FROM file WHERE id = ?',
          [body.id],
        );
        rotatedPath = row.full_path;
      });

      it('stores the displayed dimensions, not the stored ones', async () => {
        const [row] = await db.query(
          'SELECT metadata FROM file WHERE full_path = ?',
          [rotatedPath],
        );
        const metadata = JSON.parse(row.metadata);

        // Stored 120x60; displayed 60x120 once the orientation is applied.
        expect(metadata.width).toBe(60);
        expect(metadata.height).toBe(120);
      });

      it('rotates a scaled variant rather than leaving it sideways', async () => {
        const response = await http()
          .get(`/api/static/cache/300/${rotatedPath}`)
          .expect(200);

        const meta = await sharp(response.body).metadata();

        // Portrait, and never enlarged past the 120px source height.
        expect(meta.height).toBeGreaterThan(meta.width!);
        expect(meta.width).toBe(60);
        expect(meta.height).toBe(120);
      });

      it('rotates a cropped variant too', async () => {
        const response = await http()
          .get(`/api/static/cache/avatar/${rotatedPath}`)
          .expect(200);

        const meta = await sharp(response.body).metadata();
        expect(meta.width).toBe(72);
        expect(meta.height).toBe(72);
      });
    });

    describe('preset scaling', () => {
      it('generates a width-only variant preserving aspect ratio', async () => {
        const response = await http()
          .get(`/api/static/cache/300/${fullPath}`)
          .expect(200);

        const meta = await sharp(response.body).metadata();
        // 200x100 source, so a 300-wide preset must not enlarge it.
        expect(meta.width).toBe(200);
        expect(meta.height).toBe(100);
      });

      it('crops to the exact box for a crop preset', async () => {
        const response = await http()
          .get(`/api/static/cache/avatar/${fullPath}`)
          .expect(200);

        const meta = await sharp(response.body).metadata();
        expect(meta.width).toBe(72);
        expect(meta.height).toBe(72);
      });

      it('writes the variant to cache/<preset>/<src>', async () => {
        await http().get(`/api/static/cache/cover/${fullPath}`).expect(200);

        const cached = join(UPLOAD_ROOT, 'cache', 'cover', fullPath);
        expect((await stat(cached)).isFile()).toBe(true);
      });

      it('serves the cached variant on a second request', async () => {
        const first = await http()
          .get(`/api/static/cache/flow_square/${fullPath}`)
          .expect(200);
        const second = await http()
          .get(`/api/static/cache/flow_square/${fullPath}`)
          .expect(200);

        expect(second.body.equals(first.body)).toBe(true);
        expect(second.headers['cache-control']).toContain('immutable');
      });

      it('supports every documented preset', async () => {
        for (const preset of [
          '1600',
          '1200',
          '900',
          '600',
          '300',
          'avatar',
          'cover',
          'small_hero',
          'smallhero',
          'flow_square',
          'flow_vertical',
          'flow_horizontal',
        ]) {
          await http()
            .get(`/api/static/cache/${preset}/${fullPath}`)
            .expect(200);
        }
      });

      it('404s an unknown preset', async () => {
        await http().get(`/api/static/cache/enormous/${fullPath}`).expect(404);
      });

      it('404s when the source does not exist', async () => {
        await http()
          .get('/api/static/cache/avatar/uploads/missing.png')
          .expect(404);
      });

      it('passes an svg through unscaled', async () => {
        const uploaded = await upload(
          'nodes',
          'image',
          Buffer.from(SVG),
          'vector.svg',
          'image/svg+xml',
        ).expect(201);
        fileIds.push(uploaded.body.id);

        const [row] = await db.query(
          'SELECT full_path FROM file WHERE id = ?',
          [uploaded.body.id],
        );

        const response = await http()
          .get(`/api/static/cache/avatar/${row.full_path}`)
          .expect(200);

        expect(response.body.toString()).toBe(SVG);
      });
    });
  });
});
