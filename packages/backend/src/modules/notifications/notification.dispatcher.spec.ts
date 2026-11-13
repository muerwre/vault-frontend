import { Logger } from '@nestjs/common';

import { NotificationDispatcher } from './notification.dispatcher';
import type { NotificationEvent } from './notification.events';
import type { UserNotificationConsumer } from './user-notification.consumer';

describe('NotificationDispatcher', () => {
  let consumed: NotificationEvent[];
  let consume: jest.Mock;
  let dispatcher: NotificationDispatcher;

  const build = (impl?: jest.Mock) => {
    consumed = [];
    consume =
      impl ??
      jest.fn(async (event: NotificationEvent) => {
        consumed.push(event);
      });

    return new NotificationDispatcher({
      name: 'test',
      consume,
    } as unknown as UserNotificationConsumer);
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    dispatcher = build();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ['nodeCreated', 'node_create'],
    ['nodeDeleted', 'node_delete'],
    ['nodeRestored', 'node_restore'],
    ['commentCreated', 'comment_create'],
    ['commentDeleted', 'comment_delete'],
    ['commentRestored', 'comment_restore'],
  ] as const)('%s emits a %s event', async (method, type) => {
    await dispatcher[method](42);

    expect(consumed).toEqual([{ type, itemId: 42 }]);
  });

  /** A notification is a side effect and must never fail its write. */
  it('swallows a consumer failure', async () => {
    dispatcher = build(jest.fn().mockRejectedValue(new Error('boom')));

    await expect(dispatcher.nodeCreated(1)).resolves.toBeUndefined();
  });

  it('logs the consumer, event and item when one fails', async () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);

    dispatcher = build(jest.fn().mockRejectedValue(new Error('boom')));
    await dispatcher.commentDeleted(7);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('comment_delete 7'),
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('boom'));
  });

  it('awaits the consumer before returning', async () => {
    let settled = false;

    dispatcher = build(
      jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        settled = true;
      }),
    );

    await dispatcher.nodeCreated(1);

    expect(settled).toBe(true);
  });
});
