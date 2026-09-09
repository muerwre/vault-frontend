import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { authHeader, createTestApp, getDataSource, WIRE_DATE } from './helpers/app';

describe('notifications (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let userId: number;
  let nodeId: number;
  let commentId: number;

  const notificationIds: number[] = [];

  const addNotification = async (
    type: 'node' | 'comment' | 'boris',
    itemId: number,
    createdAt = 'NOW()',
  ): Promise<number> => {
    await db.query(
      `INSERT INTO user_notifications (type, itemId, time, userId, created_at, updated_at)
       VALUES (?, ?, ${createdAt}, ?, ${createdAt}, ${createdAt})`,
      [type, itemId, userId],
    );
    const [row] = await db.query('SELECT LAST_INSERT_ID() AS id');
    const id = Number(row.id);
    notificationIds.push(id);
    return id;
  };

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    const username = `notifspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [user] = await db.query('SELECT id FROM user WHERE username = ?', [username]);
    userId = Number(user.id);

    await db.query(
      `INSERT INTO node
        (title, type, blocks, files_order, is_public, is_promoted, is_heroic,
         description, thumbnail, created_at, updated_at, userId)
       VALUES ('notif node', 'image', '[]', '', 1, 1, 0, 'node text', 'thumb.jpg', NOW(), NOW(), ?)`,
      [userId],
    );
    const [node] = await db.query('SELECT LAST_INSERT_ID() AS id');
    nodeId = Number(node.id);

    await db.query(
      `INSERT INTO comment (text, files_order, created_at, updated_at, userId, nodeId)
       VALUES ('notif comment', '', NOW(), NOW(), ?, ?)`,
      [userId, nodeId],
    );
    const [comment] = await db.query('SELECT LAST_INSERT_ID() AS id');
    commentId = Number(comment.id);
  });

  afterAll(async () => {
    await db.query('DELETE FROM user_notifications WHERE userId = ?', [userId]);
    await db.query('DELETE FROM notification_settings WHERE userId = ?', [userId]);
    await db.query('DELETE FROM comment WHERE nodeId = ?', [nodeId]);
    await db.query('DELETE FROM node WHERE id = ?', [nodeId]);
    await db.query('DELETE FROM user WHERE id = ?', [userId]);
    await app.close();
  });

  const clearNotifications = () =>
    db.query('DELETE FROM user_notifications WHERE userId = ?', [userId]);

  it('requires auth on every route', async () => {
    await http().get('/api/notifications/').expect(401);
    await http().get('/api/notifications/settings').expect(401);
    await http().post('/api/notifications/settings').send({}).expect(401);
  });

  describe('GET /notifications/', () => {
    beforeEach(clearNotifications);

    it('returns an empty feed for a user with none', async () => {
      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body).toEqual({ items: [] });
    });

    it('builds a node item from the referenced node', async () => {
      const id = await addNotification('node', nodeId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items).toHaveLength(1);
      expect(body.items[0]).toEqual({
        id,
        itemId: nodeId,
        url: `/post${nodeId}`,
        type: 'node',
        title: 'notif node',
        text: 'node text',
        thumbnail: 'thumb.jpg',
        created_at: expect.stringMatching(WIRE_DATE),
        user: { id: userId, username: expect.any(String), photo: '' },
      });
    });

    it('builds a comment item pointing at its node', async () => {
      const id = await addNotification('comment', commentId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items[0]).toEqual(
        expect.objectContaining({
          id,
          itemId: commentId,
          type: 'comment',
          // The title comes from the node, the text from the comment.
          title: 'notif node',
          text: 'notif comment',
          url: `/post${nodeId}`,
        }),
      );
    });

    /** A boris notification is a comment with a different type label. */
    it('labels a boris item as boris', async () => {
      await addNotification('boris', commentId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items[0].type).toBe('boris');
      expect(body.items[0].itemId).toBe(commentId);
    });

    /** Rows whose target is gone must not produce a broken item. */
    it('skips notifications whose referenced item no longer exists', async () => {
      await addNotification('node', 99999999);
      await addNotification('comment', 99999999);
      await addNotification('node', nodeId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items).toHaveLength(1);
      expect(body.items[0].itemId).toBe(nodeId);
    });

    it('uses camelCase for itemId only', async () => {
      await addNotification('node', nodeId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(Object.keys(body.items[0]).sort()).toEqual([
        'created_at',
        'id',
        'itemId',
        'text',
        'thumbnail',
        'title',
        'type',
        'url',
        'user',
      ]);
    });

    it('never shows another user’s notifications', async () => {
      await addNotification('node', nodeId);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId + 100000))
        .expect(200);

      expect(body.items).toEqual([]);
    });

    it('caps the feed at the page size', async () => {
      for (let i = 0; i < 25; i += 1) {
        await addNotification('node', nodeId);
      }

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items).toHaveLength(20);
    });

    it('excludes soft-deleted notifications', async () => {
      const id = await addNotification('node', nodeId);
      await db.query('UPDATE user_notifications SET deleted_at = NOW() WHERE id = ?', [
        id,
      ]);

      const { body } = await http()
        .get('/api/notifications/')
        .set(authHeader(userId))
        .expect(200);

      expect(body.items).toEqual([]);
    });
  });

  describe('GET /notifications/settings', () => {
    beforeEach(async () => {
      await db.query('DELETE FROM notification_settings WHERE userId = ?', [userId]);
    });

    it('creates a row with the defaults on first read', async () => {
      const { body } = await http()
        .get('/api/notifications/settings')
        .set(authHeader(userId))
        .expect(200);

      // Notifications start disabled; every subscription starts on.
      expect(body).toEqual({
        enabled: false,
        show_indicator: true,
        flow: true,
        boris: true,
        comments: true,
        send_telegram: true,
        send_email: true,
        last_seen: null,
        last_cleared: null,
        last_date: null,
      });

      const rows = await db.query(
        'SELECT * FROM notification_settings WHERE userId = ?',
        [userId],
      );
      expect(rows).toHaveLength(1);
    });

    it('does not create a second row on a later read', async () => {
      await http().get('/api/notifications/settings').set(authHeader(userId));
      await http().get('/api/notifications/settings').set(authHeader(userId));

      const rows = await db.query(
        'SELECT * FROM notification_settings WHERE userId = ?',
        [userId],
      );
      expect(rows).toHaveLength(1);
    });

    /** `last_date` is derived from the feed, not stored. */
    it('reports last_date from the newest notification', async () => {
      await clearNotifications();
      await addNotification('node', nodeId);

      const { body } = await http()
        .get('/api/notifications/settings')
        .set(authHeader(userId))
        .expect(200);

      expect(body.last_date).toMatch(WIRE_DATE);
      await clearNotifications();
    });
  });

  describe('POST /notifications/settings', () => {
    beforeEach(async () => {
      await db.query('DELETE FROM notification_settings WHERE userId = ?', [userId]);
    });

    const patch = (body: Record<string, unknown>) =>
      http().post('/api/notifications/settings').set(authHeader(userId)).send(body);

    it('answers 200 with the updated settings', async () => {
      const { body } = await patch({ enabled: true }).expect(200);

      expect(body.enabled).toBe(true);
    });

    /** The wire keys do not match the columns. */
    it('maps flow, boris and comments onto the subscribed_to_* columns', async () => {
      await patch({ flow: false, boris: false, comments: false }).expect(200);

      const [row] = await db.query(
        `SELECT subscribed_to_flow, subscribed_to_boris, subscribed_to_comments
           FROM notification_settings WHERE userId = ?`,
        [userId],
      );

      expect(Number(row.subscribed_to_flow)).toBe(0);
      expect(Number(row.subscribed_to_boris)).toBe(0);
      expect(Number(row.subscribed_to_comments)).toBe(0);
    });

    it('leaves absent fields untouched', async () => {
      await patch({ enabled: true, send_email: false }).expect(200);

      const { body } = await patch({ show_indicator: false }).expect(200);

      expect(body.enabled).toBe(true);
      expect(body.send_email).toBe(false);
      expect(body.show_indicator).toBe(false);
    });

    it('persists across a fresh read', async () => {
      await patch({ enabled: true, send_telegram: false }).expect(200);

      const { body } = await http()
        .get('/api/notifications/settings')
        .set(authHeader(userId))
        .expect(200);

      expect(body.enabled).toBe(true);
      expect(body.send_telegram).toBe(false);
    });

    it('acknowledges the feed via last_seen and last_cleared', async () => {
      const at = '2026-05-03T12:00:00.000Z';

      const { body } = await patch({ last_seen: at, last_cleared: at }).expect(200);

      expect(body.last_seen).toBe('2026-05-03T12:00:00Z');
      expect(body.last_cleared).toBe('2026-05-03T12:00:00Z');
    });

    it('ignores an unparseable timestamp rather than erroring', async () => {
      const { body } = await patch({ last_seen: 'nonsense' }).expect(200);

      expect(body.last_seen).toBeNull();
    });

    it('tolerates an empty body', async () => {
      await patch({}).expect(200);
    });

    it('creates the row when none exists yet', async () => {
      await patch({ enabled: true }).expect(200);

      const rows = await db.query(
        'SELECT * FROM notification_settings WHERE userId = ?',
        [userId],
      );
      expect(rows).toHaveLength(1);
    });
  });
});
