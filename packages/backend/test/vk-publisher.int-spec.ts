// Publisher config for the spec. Deliberately left *disabled* so the interval
// loop never starts and no VK call is attempted on boot — the publish path is
// driven directly instead, with the api stubbed.
process.env.NOTIFICATIONS_VK_ENABLED = 'false';
process.env.NOTIFICATIONS_VK_GROUP_ID = '46579663';
process.env.NOTIFICATIONS_VK_ALBUM_ID = '166389890';
process.env.NOTIFICATIONS_VK_URL_PREFIX = 'https://vault48.example';
process.env.NOTIFICATIONS_VK_COOLDOWN_MINS = '5';
process.env.NOTIFICATIONS_VK_PURGE_AFTER_DAYS = '7';

import type { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import type { DataSource } from 'typeorm';

import { VkApiService } from '../src/modules/vk/vk.api';
import { VkPublisher } from '../src/modules/vk/vk.publisher';

import {
  authHeader,
  clearNotificationsAbove,
  createTestApp,
  type DispatchWatermark,
  getDataSource,
  notificationWatermark,
} from './helpers/app';

describe('vk publisher (integration)', () => {
  let app: INestApplication;
  let db: DataSource;
  let http: () => ReturnType<typeof request>;

  let publisher: VkPublisher;
  let api: VkApiService;
  let postToWall: jest.SpyInstance;
  let uploadPhoto: jest.SpyInstance;

  let notificationMark: DispatchWatermark;
  let queueMark: number;
  let publicationMark: number;

  let authorId: number;
  let imageId: number;

  const nodeIds: number[] = [];

  const createNode = async (
    body: Record<string, unknown> = {},
  ): Promise<number> => {
    const { body: response } = await http()
      .post('/api/nodes/')
      .set(authHeader(authorId))
      .send({ type: 'image', files: [{ id: imageId }], ...body })
      .expect(200);

    const id = Number(response.node.id);
    nodeIds.push(id);

    return id;
  };

  const queueRows = (nodeId: number) =>
    db.query(
      "SELECT * FROM app_notifications WHERE app = 'vk' AND item_id = ?",
      [nodeId],
    );

  /** Backdates a queue row so it falls outside the cooldown. */
  const ageQueueRow = (nodeId: number, minutes: number) =>
    db.query(
      "UPDATE app_notifications SET created_at = NOW() - INTERVAL ? MINUTE WHERE app = 'vk' AND item_id = ?",
      [minutes, nodeId],
    );

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
    http = () => request(app.getHttpServer());

    publisher = app.get(VkPublisher);
    api = app.get(VkApiService);

    notificationMark = await notificationWatermark(db);
    const [marks] = await db.query(
      'SELECT COALESCE(MAX(id), 0) AS q FROM app_notifications',
    );
    queueMark = Number(marks.q);
    const [pubs] = await db.query(
      'SELECT COALESCE(MAX(id), 0) AS p FROM node_social_publications',
    );
    publicationMark = Number(pubs.p);

    const username = `vkspec_${Date.now()}`;
    await db.query(
      `INSERT INTO user (username, password, email, role, is_activated, created_at, updated_at, last_seen)
       VALUES (?, ?, ?, 'user', 1, NOW(), NOW(), NOW())`,
      [username, await bcrypt.hash('x', 4), `${username}@example.com`],
    );
    const [row] = await db.query('SELECT id FROM user WHERE username = ?', [
      username,
    ]);
    authorId = Number(row.id);

    const [image] = await db.query(
      "SELECT id FROM file WHERE type = 'image' AND deleted_at IS NULL LIMIT 1",
    );
    imageId = Number(image.id);
  });

  beforeEach(async () => {
    postToWall = jest.spyOn(api, 'postToWall').mockResolvedValue(4242);
    uploadPhoto = jest.spyOn(api, 'uploadPhoto').mockResolvedValue(null);

    // `runOnce` publishes everything due, so a row left pending by an earlier
    // test would be picked up here and counted against this one.
    await db.query('DELETE FROM app_notifications WHERE id > ?', [queueMark]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await clearNotificationsAbove(db, notificationMark);
    await db.query('DELETE FROM app_notifications WHERE id > ?', [queueMark]);
    await db.query('DELETE FROM node_social_publications WHERE id > ?', [
      publicationMark,
    ]);

    for (const id of nodeIds) {
      await db.query('DELETE FROM node_files_file WHERE nodeId = ?', [id]);
      await db.query('DELETE FROM node WHERE id = ?', [id]);
    }

    await db.query('DELETE FROM user WHERE id = ?', [authorId]);
    await app.close();
  });

  describe('queuing', () => {
    it('queues a new node for publication', async () => {
      const nodeId = await createNode();
      const [row] = await queueRows(nodeId);

      expect(row.type).toBe('node');
      expect(row.sent_at).toBeNull();
    });

    /** The stored item timestamp is the node's, not the enqueue time. */
    it('records the node’s creation time on the queue row', async () => {
      const nodeId = await createNode();

      const [row] = await queueRows(nodeId);
      const [node] = await db.query(
        'SELECT created_at FROM node WHERE id = ?',
        [nodeId],
      );

      expect(new Date(row.item_created_at).getTime()).toBe(
        new Date(node.created_at).getTime(),
      );
    });

    it('does not queue the same node twice', async () => {
      const nodeId = await createNode();

      await http()
        .post('/api/nodes/')
        .set(authHeader(authorId))
        .send({
          id: nodeId,
          type: 'image',
          title: 'edited',
          files: [{ id: imageId }],
        })
        .expect(200);

      expect(await queueRows(nodeId)).toHaveLength(1);
    });

    it('withdraws a node deleted before it goes out', async () => {
      const nodeId = await createNode();

      await http()
        .delete(`/api/nodes/${nodeId}?is_locked=true`)
        .set(authHeader(authorId))
        .expect(200);

      expect(await queueRows(nodeId)).toEqual([]);
    });

    /** Once posted, the record stays — it is the proof it went out. */
    it('keeps the row for a node deleted after it was sent', async () => {
      const nodeId = await createNode();
      await db.query(
        "UPDATE app_notifications SET sent_at = NOW() WHERE app = 'vk' AND item_id = ?",
        [nodeId],
      );

      await http()
        .delete(`/api/nodes/${nodeId}?is_locked=true`)
        .set(authHeader(authorId))
        .expect(200);

      expect(await queueRows(nodeId)).toHaveLength(1);
    });
  });

  describe('publishing', () => {
    /** The cooldown is a grace period, so a fresh node is not posted yet. */
    it('leaves a node still inside the cooldown alone', async () => {
      const nodeId = await createNode();

      await publisher.runOnce();

      expect(postToWall).not.toHaveBeenCalled();
      const [row] = await queueRows(nodeId);
      expect(row.sent_at).toBeNull();
    });

    it('posts a node once the cooldown has passed', async () => {
      const nodeId = await createNode({ title: 'публикуемый пост' });
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();

      expect(postToWall).toHaveBeenCalledTimes(1);
      const [message] = postToWall.mock.calls[0];
      expect(message).toContain('публикуемый пост');
      expect(message).toContain(`https://vault48.example/post${nodeId}`);
    });

    it('marks the row sent and records the backlink', async () => {
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();

      const [row] = await queueRows(nodeId);
      expect(row.sent_at).not.toBeNull();

      const [publication] = await db.query(
        'SELECT provider, link FROM node_social_publications WHERE node_id = ?',
        [nodeId],
      );
      expect(publication.provider).toBe('vkontakte');
      expect(publication.link).toBe('https://vk.com/wall-46579663_4242');
    });

    it('does not post the same node twice', async () => {
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();
      await publisher.runOnce();

      expect(postToWall).toHaveBeenCalledTimes(1);
    });

    /** A backlog must not be dumped onto the wall all at once. */
    it('ignores a node older than the purge horizon', async () => {
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 60 * 24 * 8);

      await publisher.runOnce();

      expect(postToWall).not.toHaveBeenCalled();
      const [row] = await queueRows(nodeId);
      expect(row.sent_at).toBeNull();
    });

    it('attaches the thumbnail when one uploads', async () => {
      uploadPhoto.mockResolvedValue('photo-1_2');
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();

      expect(uploadPhoto).toHaveBeenCalled();
      expect(postToWall.mock.calls[0][1]).toEqual(['photo-1_2']);
    });

    /** A missing photo is not worth losing the post over. */
    it('posts without an attachment when the upload fails', async () => {
      uploadPhoto.mockResolvedValue(null);
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();

      expect(postToWall.mock.calls[0][1]).toEqual([]);
    });

    it('leaves the row unsent when posting fails, so it retries', async () => {
      postToWall.mockRejectedValue(new Error('vk is down'));
      const nodeId = await createNode();
      await ageQueueRow(nodeId, 10);

      await publisher.runOnce();

      const [row] = await queueRows(nodeId);
      expect(row.sent_at).toBeNull();
    });

    describe('nodes that no longer qualify', () => {
      const expectDropped = async (nodeId: number) => {
        await publisher.runOnce();

        expect(postToWall).not.toHaveBeenCalled();
        expect(await queueRows(nodeId)).toEqual([]);
      };

      it('drops a node that has been hidden', async () => {
        const nodeId = await createNode();
        await ageQueueRow(nodeId, 10);
        await db.query('UPDATE node SET is_public = 0 WHERE id = ?', [nodeId]);

        await expectDropped(nodeId);
      });

      /** Lab nodes are unpromoted and are not announced. */
      it('drops a node demoted out of the flow', async () => {
        const nodeId = await createNode();
        await ageQueueRow(nodeId, 10);
        await db.query('UPDATE node SET is_promoted = 0 WHERE id = ?', [
          nodeId,
        ]);

        await expectDropped(nodeId);
      });

      it('drops a node that has since been deleted', async () => {
        const nodeId = await createNode();
        await ageQueueRow(nodeId, 10);
        await db.query('UPDATE node SET deleted_at = NOW() WHERE id = ?', [
          nodeId,
        ]);

        await expectDropped(nodeId);
      });
    });
  });
});
