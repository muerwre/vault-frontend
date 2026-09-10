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
} from './helpers/app';

const BORIS_NODE_ID = 696;

interface Subscriptions {
  enabled?: boolean;
  flow?: boolean;
  boris?: boolean;
  comments?: boolean;
  /** Days since the account was last seen; beyond the window it gets nothing. */
  lastSeenDaysAgo?: number;
  deleted?: boolean;
}

describe('notification dispatch (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let mark: number;
  let author: number;
  let watcher: number;
  let imageId: number;

  const userIds: number[] = [];
  const nodeIds: number[] = [];

  /** Creates a user, subscribed to everything and recently seen by default. */
  const makeUser = async (subs: Subscriptions = {}): Promise<number> => {
    const {
      enabled = true,
      flow = true,
      boris = true,
      comments = true,
      lastSeenDaysAgo = 1,
      deleted = false,
    } = subs;

    const username = `dispatch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await db.query(
      `INSERT INTO user
         (username, password, email, role, is_activated, created_at, updated_at,
          last_seen, deleted_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW(),
               NOW() - INTERVAL ? DAY, ${deleted ? 'NOW()' : 'NULL'})`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`, lastSeenDaysAgo],
    );

    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    const id = Number(row.id);
    userIds.push(id);

    await db.query(
      `INSERT INTO notification_settings
         (userId, enabled, show_indicator, send_telegram, send_email,
          subscribed_to_flow, subscribed_to_boris, subscribed_to_comments)
       VALUES (?, ?, 1, 1, 1, ?, ?, ?)`,
      [id, enabled ? 1 : 0, flow ? 1 : 0, boris ? 1 : 0, comments ? 1 : 0],
    );

    return id;
  };

  const rowsFor = (
    type: string,
    itemId: number,
  ): Promise<Array<{ userId: number; time: string; created_at: string }>> =>
    db.query(
      'SELECT userId, time, created_at FROM user_notifications WHERE type = ? AND itemId = ? AND id > ?',
      [type, itemId, mark],
    );

  const recipientsOf = async (type: string, itemId: number): Promise<number[]> =>
    (await rowsFor(type, itemId)).map(row => Number(row.userId)).sort((a, b) => a - b);

  const createNode = async (
    uid: number,
    body: Record<string, unknown> = {},
  ): Promise<number> => {
    const { body: response } = await http()
      .post('/api/nodes/')
      .set(authHeader(uid))
      .send({ type: 'image', files: [{ id: imageId }], ...body })
      .expect(200);

    const id = Number(response.node.id);
    nodeIds.push(id);

    return id;
  };

  const comment = (uid: number, nodeId: number, text: string, id?: number) =>
    http()
      .post(`/api/nodes/${nodeId}/comments`)
      .set(authHeader(uid))
      .send({ text, ...(id ? { id } : {}) })
      .expect(200);

  const setLocked = (uid: number, nodeId: number, locked: boolean) =>
    http()
      .delete(`/api/nodes/${nodeId}?is_locked=${locked}`)
      .set(authHeader(uid))
      .expect(200);

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    mark = await notificationWatermark(db);

    const [image] = await db.query(
      "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 1",
    );
    imageId = Number(image.id);

    author = await makeUser();
    watcher = await makeUser();
  });

  afterAll(async () => {
    await clearNotificationsAbove(db, mark);

    for (const id of nodeIds) {
      await db.query('DELETE FROM node_files_file WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM comment WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }

    await db.query('DELETE FROM comment WHERE userId IN (?)', [userIds]);

    for (const id of userIds) {
      await db.query('DELETE FROM notification_settings WHERE userId = ?', [id]);
      await db.query('DELETE FROM user WHERE id = ?', [id]);
    }

    await app.close();
  });

  describe('node created', () => {
    it('notifies flow watchers but never the author', async () => {
      const nodeId = await createNode(author);
      const recipients = await recipientsOf('node', nodeId);

      expect(recipients).toContain(watcher);
      expect(recipients).not.toContain(author);
    });

    /** The row timestamps describe when the node appeared, not when we fanned out. */
    it('stamps rows with the node’s creation time', async () => {
      const nodeId = await createNode(author);

      const [row] = await rowsFor('node', nodeId);
      const [node] = await db.query('SELECT created_at FROM node WHERE id = ?', [
        nodeId,
      ]);

      expect(new Date(row.time).getTime()).toBe(
        new Date(node.created_at).getTime(),
      );
      expect(new Date(row.created_at).getTime()).toBe(
        new Date(node.created_at).getTime(),
      );
    });

    it('notifies about a lab node too', async () => {
      const nodeId = await createNode(author, { is_promoted: false });

      expect(await recipientsOf('node', nodeId)).toContain(watcher);
    });

    /** A node nobody can see must not surface in anybody's feed. */
    it('stays silent about a non-public node', async () => {
      const nodeId = await createNode(author, { is_public: false });

      expect(await recipientsOf('node', nodeId)).toEqual([]);
    });

    it('does not notify again when the node is edited', async () => {
      const nodeId = await createNode(author);
      const before = await recipientsOf('node', nodeId);

      await http()
        .post('/api/nodes/')
        .set(authHeader(author))
        .send({ id: nodeId, type: 'image', title: 'edited', files: [{ id: imageId }] })
        .expect(200);

      expect(await recipientsOf('node', nodeId)).toEqual(before);
    });

    it('surfaces the notification in the recipient’s feed', async () => {
      const nodeId = await createNode(author, { title: 'dispatched node' });

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(watcher))
        .expect(200);

      expect(body.items[0]).toEqual(
        expect.objectContaining({ type: 'node', itemId: nodeId }),
      );
    });
  });

  describe('recipient filtering', () => {
    it.each([
      ['notifications disabled', { enabled: false }],
      ['the flow subscription off', { flow: false }],
      ['no recent activity', { lastSeenDaysAgo: 400 }],
      ['a deleted account', { deleted: true }],
    ] as Array<[string, Subscriptions]>)('skips a user with %s', async (_, subs) => {
      const excluded = await makeUser(subs);
      const nodeId = await createNode(author);

      expect(await recipientsOf('node', nodeId)).not.toContain(excluded);
    });

    /** A duplicate settings row must not double the notification. */
    it('writes one row per recipient even with duplicate settings', async () => {
      const doubled = await makeUser();
      await db.query(
        `INSERT INTO notification_settings
           (userId, enabled, subscribed_to_flow, subscribed_to_boris, subscribed_to_comments)
         VALUES (?, 1, 1, 1, 1)`,
        [doubled],
      );

      const nodeId = await createNode(author);
      const recipients = await recipientsOf('node', nodeId);

      expect(recipients.filter(id => id === doubled)).toHaveLength(1);
    });
  });

  describe('node deleted and restored', () => {
    it('removes the rows outright when the node is locked', async () => {
      const nodeId = await createNode(author);
      expect(await recipientsOf('node', nodeId)).not.toEqual([]);

      await setLocked(author, nodeId, true);

      expect(await recipientsOf('node', nodeId)).toEqual([]);
    });

    it('rebuilds them when the node comes back', async () => {
      const nodeId = await createNode(author);
      await setLocked(author, nodeId, true);
      await setLocked(author, nodeId, false);

      expect(await recipientsOf('node', nodeId)).toContain(watcher);
    });

    /** Restoring must respect visibility exactly as creating does. */
    it('does not resurrect rows for a non-public node', async () => {
      const nodeId = await createNode(author, { is_public: false });
      await setLocked(author, nodeId, true);
      await setLocked(author, nodeId, false);

      expect(await recipientsOf('node', nodeId)).toEqual([]);
    });
  });

  describe('comment created', () => {
    let nodeId: number;

    beforeAll(async () => {
      nodeId = await createNode(author);
    });

    it('notifies the node author, not the commenter', async () => {
      const { body } = await comment(watcher, nodeId, 'a comment from the watcher');
      const commentId = Number(body.comment.id);

      const recipients = await recipientsOf('comment', commentId);
      expect(recipients).toContain(author);
      expect(recipients).not.toContain(watcher);
    });

    it('notifies earlier participants as well', async () => {
      const third = await makeUser();
      await comment(third, nodeId, 'the third voice speaks');

      const { body } = await comment(watcher, nodeId, 'answering the third voice');
      const recipients = await recipientsOf('comment', Number(body.comment.id));

      expect(recipients).toContain(author);
      expect(recipients).toContain(third);
    });

    it('does not notify again when the comment is edited', async () => {
      const { body } = await comment(watcher, nodeId, 'first thoughts on the matter');
      const commentId = Number(body.comment.id);
      const before = await recipientsOf('comment', commentId);

      await comment(watcher, nodeId, 'second thoughts on the matter', commentId);

      expect(await recipientsOf('comment', commentId)).toEqual(before);
    });

    /** Only subscribers to comments hear about them. */
    it('skips a participant unsubscribed from comments', async () => {
      const quiet = await makeUser({ comments: false });
      await comment(quiet, nodeId, 'a comment from someone who wants quiet');

      const { body } = await comment(watcher, nodeId, 'replying to the quiet one');

      expect(await recipientsOf('comment', Number(body.comment.id))).not.toContain(
        quiet,
      );
    });

    it('removes the rows when the comment is locked, and rebuilds them', async () => {
      const { body } = await comment(watcher, nodeId, 'a comment to be deleted');
      const commentId = Number(body.comment.id);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}?is_locked=true`)
        .set(authHeader(watcher))
        .expect(200);

      expect(await recipientsOf('comment', commentId)).toEqual([]);

      await http()
        .delete(`/api/nodes/${nodeId}/comments/${commentId}?is_locked=false`)
        .set(authHeader(watcher))
        .expect(200);

      expect(await recipientsOf('comment', commentId)).toContain(author);
    });
  });

  describe('Boris comments', () => {
    it('notifies Boris watchers under the boris type', async () => {
      const { body } = await comment(
        author,
        BORIS_NODE_ID,
        'a comment on Boris from the dispatch spec',
      );
      const commentId = Number(body.comment.id);

      await db.query('DELETE FROM comment WHERE id = ?', [commentId]);

      expect(await recipientsOf('boris', commentId)).toContain(watcher);
      // The ordinary comment type is not used for Boris.
      expect(await recipientsOf('comment', commentId)).toEqual([]);
    });

    it('skips a user unsubscribed from Boris', async () => {
      const quiet = await makeUser({ boris: false });

      const { body } = await comment(
        author,
        BORIS_NODE_ID,
        'another Boris comment from the dispatch spec',
      );
      const commentId = Number(body.comment.id);

      await db.query('DELETE FROM comment WHERE id = ?', [commentId]);

      expect(await recipientsOf('boris', commentId)).not.toContain(quiet);
    });
  });
});
