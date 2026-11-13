import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  type DispatchWatermark,
  getDataSource,
  notificationWatermark,
  WIRE_DATE,
} from './helpers/app';
import {
  deleteFiles,
  type FileType,
  makeFile as makeFileRow,
  readFile,
} from './helpers/fixtures';

describe('comment writes (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let notificationMark: DispatchWatermark;
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

  const fileIds: number[] = [];

  const makeFile = async (
    type: FileType,
    options?: Parameters<typeof makeFileRow>[3],
  ) => {
    const id = await makeFileRow(db, authorId, type, options);
    fileIds.push(id);

    return id;
  };

  const fileRow = (id: number) => readFile(db, id);

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

    await deleteFiles(db, fileIds);

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

    it("does not flag the node as updated for the comment's own author", async () => {
      const nodeId = await makeNode();
      const updatedFor = async (uid: number) => {
        const { body } = await http()
          .get('/api/nodes/?with_updated=true')
          .set(authHeader(uid))
          .expect(200);

        return (body.updated as Array<{ id: number }>).map((node) => node.id);
      };

      // Seen an hour ago, then commented on by the same person.
      await db.query(
        'INSERT INTO node_view (userId, nodeId, visited) VALUES (?, ?, NOW() - INTERVAL 1 HOUR)',
        [otherId, nodeId],
      );
      const { body } = await post(nodeId, otherId, { text: 'my own' }).expect(
        200,
      );
      track(body.comment.id);

      expect(await updatedFor(otherId)).not.toContain(nodeId);

      // Control: a later comment by someone else does flag it.
      await db.query(
        'UPDATE node SET commented_at = NOW() + INTERVAL 1 MINUTE WHERE id = ?',
        [nodeId],
      );
      expect(await updatedFor(otherId)).toContain(nodeId);

      await db.query('DELETE FROM node_view WHERE nodeId = ?', [nodeId]);
    });

    /**
     * A comment stamped hours ahead, as a database clock in another timezone
     * would stamp it, must not leave a lab post flagged for the person who
     * just commented, edits included.
     */
    it('clears the lab flag for the commenter even past a skewed comment', async () => {
      const nodeId = await makeNode({ isPromoted: false });
      const labUpdatesFor = async (uid: number) => {
        const { body } = await http()
          .get('/api/nodes/lab/updates')
          .set(authHeader(uid))
          .expect(200);

        return (body.nodes as Array<{ id: number }>).map((node) => node.id);
      };

      await db.query(
        `INSERT INTO comment (text, files_order, created_at, updated_at, userId, nodeId)
         VALUES ('from a skewed clock', '', NOW() + INTERVAL 3 HOUR, NOW(), ?, ?)`,
        [authorId, nodeId],
      );
      const [skewed] = await db.query('SELECT LAST_INSERT_ID() AS id');
      track(Number(skewed.id));
      await db.query(
        'INSERT INTO node_view (userId, nodeId, visited) VALUES (?, ?, NOW() - INTERVAL 1 HOUR)',
        [otherId, nodeId],
      );

      const { body } = await post(nodeId, otherId, { text: 'mine' }).expect(
        200,
      );
      track(body.comment.id);
      expect(await labUpdatesFor(otherId)).not.toContain(nodeId);

      await post(nodeId, otherId, {
        id: body.comment.id,
        text: 'mine, edited',
      }).expect(200);
      expect(await labUpdatesFor(otherId)).not.toContain(nodeId);

      await db.query('DELETE FROM node_view WHERE nodeId = ?', [nodeId]);
    });

    /** Views are stamped by the database clock, so comments must be too. */
    it("stamps a new comment with the database's clock", async () => {
      const nodeId = await makeNode();
      const dbNow = async () => {
        const [row] = await db.query('SELECT NOW() AS now');
        return new Date(row.now).getTime();
      };

      const before = await dbNow();
      const { body } = await post(nodeId, otherId, { text: 'when' }).expect(
        200,
      );
      track(body.comment.id);
      const after = await dbNow();

      const [row] = await db.query(
        'SELECT created_at FROM comment WHERE id = ?',
        [body.comment.id],
      );
      const stamped = new Date(row.created_at).getTime();

      expect(stamped).toBeGreaterThanOrEqual(before);
      expect(stamped).toBeLessThanOrEqual(after);
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

    it('403s an edit whose comment belongs to another node', async () => {
      const first = await makeNode();
      const second = await makeNode();

      const created = await post(first, authorId, { text: 'elsewhere' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);

      await post(second, authorId, {
        id: commentId,
        text: 'wrong node',
      }).expect(403);
    });

    it("403s a stranger's edit before looking at its body", async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'mine' }).expect(
        200,
      );
      track(created.body.comment.id);

      // An empty body would be a 400, but the rights check comes first.
      await post(nodeId, otherId, {
        id: created.body.comment.id,
        text: '',
      }).expect(403);
    });

    it('keeps only image and audio files that exist and are not deleted', async () => {
      const nodeId = await makeNode();
      const image = await makeFile('image');
      const audio = await makeFile('audio');
      const video = await makeFile('video');
      const gone = await makeFile('image', { deleted: true });

      const { body } = await post(nodeId, authorId, {
        text: 'files',
        files: [{ id: audio }, { id: video }, { id: gone }, { id: image }],
      }).expect(200);
      track(body.comment.id);

      expect(body.comment.files.map((file: { id: number }) => file.id)).toEqual(
        [audio, image],
      );
    });

    it("marks attached files as a comment's and releases dropped ones", async () => {
      const nodeId = await makeNode();
      const kept = await makeFile('image');
      const dropped = await makeFile('image');

      const created = await post(nodeId, authorId, {
        text: 'two files',
        files: [{ id: kept }, { id: dropped }],
      }).expect(200);
      const commentId = track(created.body.comment.id);

      expect((await fileRow(kept)).target).toBe('comment');
      expect((await fileRow(dropped)).target).toBe('comment');

      await post(nodeId, authorId, {
        id: commentId,
        text: 'one file',
        files: [{ id: kept }],
      }).expect(200);

      expect((await fileRow(kept)).target).toBe('comment');
      expect((await fileRow(dropped)).target).toBeNull();
    });

    it('persists an edited audio title, and nothing else from the client', async () => {
      const nodeId = await makeNode();
      const audio = await makeFile('audio', {
        metadata: { title: 'old', duration: 5 },
      });

      const { body } = await post(nodeId, authorId, {
        text: 'renamed',
        files: [{ id: audio, metadata: { title: 'new', duration: 999 } }],
      }).expect(200);
      track(body.comment.id);

      expect((await fileRow(audio)).metadata).toEqual({
        title: 'new',
        duration: 5,
      });
    });

    it('caps text by bytes, so a long Cyrillic comment is refused', async () => {
      const nodeId = await makeNode();
      // 4100 letters, 8200 bytes: under the limit in characters, over it in bytes.
      await post(nodeId, authorId, { text: 'ж'.repeat(4100) }).expect(400);
    });

    it("fills an empty description from the author's comment, counting bytes", async () => {
      // 40 Cyrillic letters are 80 bytes: past the 64-byte threshold.
      const nodeId = await makeNode();
      const text = 'ж'.repeat(40);
      const { body } = await post(nodeId, authorId, { text }).expect(200);
      track(body.comment.id);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe(text);
    });

    it('fills the description when an edit makes the comment long enough', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, { text: 'short' }).expect(
        200,
      );
      const commentId = track(created.body.comment.id);
      const long =
        'a long enough comment to become the description of its node, surely';

      await post(nodeId, authorId, { id: commentId, text: long }).expect(200);

      const [row] = await db.query(
        'SELECT description FROM node WHERE id = ?',
        [nodeId],
      );
      expect(row.description).toBe(long);
    });

    it('leaves a file deleted after posting out of the listing', async () => {
      const nodeId = await makeNode();
      const kept = await makeFile('image');
      const removed = await makeFile('image');

      const { body } = await post(nodeId, authorId, {
        text: 'then one goes',
        files: [{ id: kept }, { id: removed }],
      }).expect(200);
      track(body.comment.id);
      await db.query('UPDATE file SET deleted_at = NOW() WHERE id = ?', [
        removed,
      ]);

      const listing = await http()
        .get(`/api/nodes/${nodeId}/comments`)
        .expect(200);
      const [comment] = listing.body.comments;
      expect(comment.files.map((file: { id: number }) => file.id)).toEqual([
        kept,
      ]);
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
    it.each([
      ['1', true],
      ['TRUE', true],
      ['t', true],
      ['0', false],
      ['false', false],
    ])('reads is_locked=%p as %p', async (flag, locks) => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, {
        text: `flag ${flag}`,
      }).expect(200);
      const commentId = track(created.body.comment.id);

      const { body } = await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: flag })
        .set(authHeader(authorId))
        .expect(200);

      expect(body.deleted_at === null).toBe(!locks);
    });

    it('400s an is_locked it cannot read', async () => {
      const nodeId = await makeNode();
      const created = await post(nodeId, authorId, {
        text: 'garbage flag',
      }).expect(200);
      const commentId = track(created.body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}`)
        .query({ is_locked: 'maybe' })
        .set(authHeader(authorId))
        .expect(400);
    });

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
