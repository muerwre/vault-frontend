import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  getDataSource,
  notificationWatermark,
  WIRE_DATE,
} from './helpers/app';

describe('comment writes (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let notificationMark: number;
  let http: () => ReturnType<typeof request>;

  let authorId: number;
  let otherId: number;
  let adminId: number;
  const nodeIds: number[] = [];
  const commentIds: number[] = [];

  const makeNode = async (
    overrides: {
      type?: string;
      isPromoted?: boolean;
      description?: string;
    } = {},
  ): Promise<number> => {
    const { type = 'image', isPromoted = true, description = '' } = overrides;

    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         description, created_at, updated_at, userId)
       VALUES (?, ?, '[]', '', 1, ?, 0, ?, NOW(), NOW(), ?)`,
      [
        `comment spec ${Date.now()}`,
        type,
        isPromoted ? 1 : 0,
        description,
        authorId,
      ],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    nodeIds.push(id);
    return id;
  };

  const makeUser = async (role: 'user' | 'admin'): Promise<number> => {
    const username = `cspec_${role}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

  const post = (nodeId: number, uid: number, body: Record<string, unknown>) =>
    http()
      .post(`/api/nodes/${nodeId}/comments`)
      .set(authHeader(uid))
      .send(body);

  const track = (id: number) => {
    commentIds.push(id);
    return id;
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    notificationMark = await notificationWatermark(db);
    http = () => request(app.getHttpServer());

    authorId = await makeUser('user');
    otherId = await makeUser('user');
    adminId = await makeUser('admin');
  });

  afterAll(async () => {
    // Writes here fan out to whoever is subscribed in the seeded database.
    await clearNotificationsAbove(db, notificationMark);

    for (const id of commentIds) {
      await db.query('DELETE FROM comment_user_likes WHERE commentId = ?', [
        id,
      ]);
      await db.query('DELETE FROM comment_files_file WHERE commentId = ?', [
        id,
      ]);
      await db.query('DELETE FROM comment WHERE id = ?', [id]);
    }
    for (const id of nodeIds) {
      await db.query('DELETE FROM comment WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node_view WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }
    for (const id of [authorId, otherId, adminId]) {
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }
    await app.close();
  });

  describe('POST /nodes/:id/comments', () => {
    it('creates a comment and returns the documented shape', async () => {
      const nodeId = await makeNode();

      const { body } = await post(nodeId, authorId, {
        text: 'hello there',
      }).expect(200);

      track(body.comment.id);
      expect(Object.keys(body.comment).sort()).toEqual([
        'created_at',
        'files',
        'id',
        'like_count',
        'liked',
        'node',
        'text',
        'updated_at',
        'user',
      ]);
      expect(body.comment.text).toBe('hello there');
      expect(body.comment.created_at).toMatch(WIRE_DATE);
      expect(body.comment.node).toBeNull();
      expect(body.comment.user.id).toBe(authorId);
    });

    it('shows up in the listing and in the count', async () => {
      const nodeId = await makeNode();

      const created = await post(nodeId, authorId, { text: 'listed' }).expect(
        200,
      );
      track(created.body.comment.id);

      const { body } = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .expect(200);

      expect(body.comment_count).toBe(1);
      expect(body.comments[0].text).toBe('listed');
    });

    /** `commented_at` drives the updated feed and the recent list. */
    it('bumps the node commented_at to the new comment', async () => {
      const nodeId = await makeNode();

      const created = await post(nodeId, authorId, { text: 'bump me' }).expect(
        200,
      );
      track(created.body.comment.id);

      const [row] = await db.query(
        'SELECT commented_at FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.commented_at).not.toBeNull();
    });

    it('updates an existing comment when id is supplied', async () => {
      const nodeId = await makeNode();

      const created = await post(nodeId, authorId, { text: 'first' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      const { body } = await post(nodeId, authorId, {
        id: commentId,
        text: 'edited',
      }).expect(200);

      expect(body.comment.id).toBe(commentId);
      expect(body.comment.text).toBe('edited');

      const listing = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .expect(200);
      expect(listing.body.comment_count).toBe(1);
    });

    it('lets an admin edit somebody else’s comment', async () => {
      const nodeId = await makeNode();

      const created = await post(nodeId, authorId, { text: 'original' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      await http()
        .post(`/api/nodes/${nodeId}/comments`)
        .set(authHeader(adminId, 'admin'))
        .send({ id: commentId, text: 'moderated' })
        .expect(200);
    });

    it('403s a different non-admin user editing a comment', async () => {
      const nodeId = await makeNode();

      const created = await post(nodeId, authorId, { text: 'mine' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      await post(nodeId, otherId, { id: commentId, text: 'hijack' }).expect(
        403,
      );
    });

    it('404s an edit whose comment belongs to another node', async () => {
      const first = await makeNode();
      const second = await makeNode();

      const created = await post(first, authorId, { text: 'elsewhere' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      await post(second, authorId, {
        id: commentId,
        text: 'wrong node',
      }).expect(404);
    });

    it('rejects an empty comment with no files', async () => {
      const nodeId = await makeNode();

      await post(nodeId, authorId, { text: '' }).expect(400);
      await post(nodeId, authorId, {}).expect(400);
    });

    it('rejects text over the length limit', async () => {
      const nodeId = await makeNode();

      await post(nodeId, authorId, { text: 'x'.repeat(8193) }).expect(400);
    });

    it('accepts text exactly at the limit', async () => {
      const nodeId = await makeNode();

      const { body } = await post(nodeId, authorId, {
        text: 'x'.repeat(8192),
      }).expect(200);
      track(body.comment.id);
    });

    it('attaches files in the requested order and drops unknown ids', async () => {
      const nodeId = await makeNode();
      const files = await db.query(
        "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 2",
      );
      const ids = files.map((f: { id: number }) => Number(f.id));

      const { body } = await post(nodeId, authorId, {
        text: 'with files',
        files: [{ id: ids[1] }, { id: ids[0] }, { id: 99999999 }],
      }).expect(200);

      track(body.comment.id);
      expect(body.comment.files.map((f: { id: number }) => f.id)).toEqual([
        ids[1],
        ids[0],
      ]);
    });

    it('accepts a file-only comment with no text', async () => {
      const nodeId = await makeNode();
      const [file] = await db.query(
        "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 1",
      );

      const { body } = await post(nodeId, authorId, {
        text: '',
        files: [{ id: Number(file.id) }],
      }).expect(200);

      track(body.comment.id);
      expect(body.comment.files).toHaveLength(1);
    });

    /** A long comment by the author fills an empty node description. */
    it('promotes a long author comment to the node description', async () => {
      const nodeId = await makeNode({ description: '' });
      const text = 'x'.repeat(80);

      const created = await post(nodeId, authorId, { text }).expect(200);
      track(created.body.comment.id);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe(text);
    });

    it('leaves an existing description alone', async () => {
      const nodeId = await makeNode({ description: 'already set' });

      const created = await post(nodeId, authorId, {
        text: 'y'.repeat(80),
      }).expect(200);
      track(created.body.comment.id);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe('already set');
    });

    it('does not promote a comment by someone else', async () => {
      const nodeId = await makeNode({ description: '' });

      const created = await post(nodeId, otherId, {
        text: 'z'.repeat(80),
      }).expect(200);
      track(created.body.comment.id);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe('');
    });

    it('does not promote a short comment', async () => {
      const nodeId = await makeNode({ description: '' });

      const created = await post(nodeId, authorId, {
        text: 'too short',
      }).expect(200);
      track(created.body.comment.id);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe('');
    });

    it('accepts comments on a lab node and on boris', async () => {
      const lab = await makeNode({ isPromoted: false });
      const boris = await makeNode({ type: 'boris' });

      const one = await post(lab, authorId, { text: 'lab comment' }).expect(
        200,
      );
      const two = await post(boris, authorId, { text: 'boris comment' }).expect(
        200,
      );

      track(one.body.comment.id);
      track(two.body.comment.id);
    });

    it('requires auth and 404s an unknown node', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/comments`)
        .send({ text: 'x' })
        .expect(401);
      await post(99999999, authorId, { text: 'x' }).expect(404);
    });
  });

  describe('POST /nodes/:id/comments/:cid/likes', () => {
    it('sets and clears a like from another user', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'likeable' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      const liked = await http()
        .post(`/api/nodes/${nodeId}/comments/${commentId}/likes`)
        .set(authHeader(otherId))
        .send({ liked: true })
        .expect(200);
      expect(liked.body.comment.like_count).toBe(1);
      expect(liked.body.comment.liked).toBe(true);

      const cleared = await http()
        .post(`/api/nodes/${nodeId}/comments/${commentId}/likes`)
        .set(authHeader(otherId))
        .send({ liked: false })
        .expect(200);
      expect(cleared.body.comment.like_count).toBe(0);
      expect(cleared.body.comment.liked).toBe(false);
    });

    it('is idempotent when liking twice', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'twice' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      const url = `/api/nodes/${nodeId}/comments/${commentId}/likes`;
      await http().post(url).set(authHeader(otherId)).send({ liked: true });
      const { body } = await http()
        .post(url)
        .set(authHeader(otherId))
        .send({ liked: true })
        .expect(200);

      expect(body.comment.like_count).toBe(1);
    });

    it('refuses liking your own comment', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'self' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      const { body } = await http()
        .post(`/api/nodes/${nodeId}/comments/${commentId}/likes`)
        .set(authHeader(authorId))
        .send({ liked: true })
        .expect(400);

      expect(body.error).toBe('CantSaveComment');
    });

    it('404s an unknown comment and requires auth', async () => {
      const nodeId = await makeNode();

      await http()
        .post(`/api/nodes/${nodeId}/comments/99999999/likes`)
        .set(authHeader(otherId))
        .send({ liked: true })
        .expect(404);
      await http()
        .post(`/api/nodes/${nodeId}/comments/1/likes`)
        .send({ liked: true })
        .expect(401);
    });
  });

  describe('DELETE /nodes/:id/comments/:cid', () => {
    it('locks a comment, hiding it from the listing', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'doomed' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at).toMatch(WIRE_DATE);

      const listing = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .expect(200);
      expect(listing.body.comment_count).toBe(0);
    });

    it('restores a locked comment', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, {
        text: 'back again',
      }).expect(200);
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId));

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'false' })
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at).toBeNull();

      const listing = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .expect(200);
      expect(listing.body.comment_count).toBe(1);
    });

    /** Removing the only comment must clear commented_at, not leave it stale. */
    it('clears the node commented_at when no comments remain', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'only one' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId))
        .expect(200);

      const [row] = await db.query(
        'SELECT commented_at FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.commented_at).toBeNull();
    });

    it('re-points commented_at at the newest survivor', async () => {
      const nodeId = await makeNode();
      const first = await post(nodeId, authorId, { text: 'older' }).expect(200);
      track(first.body.comment.id);
      const second = await post(nodeId, authorId, { text: 'newer' }).expect(
        200,
      );
      const secondId = track(second.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${secondId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId))
        .expect(200);

      const [row] = await db.query(
        'SELECT commented_at FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.commented_at).not.toBeNull();
    });

    it('lets an admin lock somebody else’s comment', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, {
        text: 'moderate me',
      }).expect(200);
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(adminId, 'admin'))
        .expect(200);
    });

    it('404s a different non-admin user', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, {
        text: 'not yours',
      }).expect(200);
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(otherId))
        .expect(404);
    });

    it('404s a comment that belongs to another node', async () => {
      const first = await makeNode();
      const second = await makeNode();
      const created = await post(first, authorId, {
        text: 'mismatched',
      }).expect(200);
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${second}/comments/${commentId}`)
        .query({ is_locked: 'true' })
        .set(authHeader(authorId))
        .expect(404);
    });

    it('requires auth', async () => {
      const nodeId = await makeNode();

      await http().delete(`/api/nodes/${nodeId}/comments/1`).expect(401);
    });
  });
});
