import type { Repository } from 'typeorm';

import type { NodeSocialPublication } from '../../entities/node-extras.entity';
import type { Node } from '../../entities/node.entity';

import type { VkApiService } from './vk.api';
import { VkPublisher } from './vk.publisher';
import type { VkQueueService } from './vk.queue';

/**
 * The run loop with its dependencies stubbed. Only `pending` matters here: the
 * guards being checked all live around it, and blocking it is what lets a run
 * be held open mid-flight.
 */
const makePublisher = (pending: jest.Mock) => {
  const queue = { pending, dropUnsent: jest.fn() } as unknown as VkQueueService;
  const api = {} as VkApiService;
  const nodes = {} as Repository<Node>;
  const publications = {} as Repository<NodeSocialPublication>;

  return { publisher: new VkPublisher(queue, api, nodes, publications), queue };
};

/** A `pending` that blocks until released, and says when it was entered. */
const blockingPending = () => {
  let release!: (rows: unknown[]) => void;
  let entered!: () => void;
  const reached = new Promise<void>((resolve) => {
    entered = resolve;
  });

  const pending = jest.fn(
    () =>
      new Promise((resolve) => {
        release = resolve as (rows: unknown[]) => void;
        entered();
      }),
  );

  return { pending, reached, release: (rows: unknown[] = []) => release(rows) };
};

describe('VkPublisher run loop', () => {
  /**
   * A run slower than the interval would otherwise read the same queue rows
   * again and post the node to the group a second time.
   */
  it('skips a run while another is still going', async () => {
    const { pending, reached, release } = blockingPending();
    const { publisher } = makePublisher(pending);

    const first = publisher.runOnce();
    await reached;
    const second = publisher.runOnce();

    release();
    await Promise.all([first, second]);

    expect(pending).toHaveBeenCalledTimes(1);
  });

  it('runs again once the previous run has finished', async () => {
    const pending = jest.fn().mockResolvedValue([]);
    const { publisher } = makePublisher(pending);

    await publisher.runOnce();
    await publisher.runOnce();

    expect(pending).toHaveBeenCalledTimes(2);
  });

  /** An unhandled rejection from the timer would take the process down. */
  it('swallows a failure rather than rejecting', async () => {
    const pending = jest.fn().mockRejectedValue(new Error('database is away'));
    const { publisher } = makePublisher(pending);

    await expect(publisher.runOnce()).resolves.toBeUndefined();

    // And the failure does not wedge the guard shut.
    pending.mockResolvedValue([]);
    await publisher.runOnce();
    expect(pending).toHaveBeenCalledTimes(2);
  });

  it('waits for the run in progress when shutting down', async () => {
    const { pending, reached, release } = blockingPending();
    const { publisher } = makePublisher(pending);

    const run = publisher.runOnce();
    await reached;

    let finished = false;
    const shutdown = publisher.onModuleDestroy().then(() => {
      finished = true;
    });

    await new Promise((resolve) => setImmediate(resolve));
    expect(finished).toBe(false);

    release();
    await Promise.all([run, shutdown]);
    expect(finished).toBe(true);
  });

  it('does nothing on shutdown when no run is going', async () => {
    const { publisher } = makePublisher(jest.fn().mockResolvedValue([]));

    await expect(publisher.onModuleDestroy()).resolves.toBeUndefined();
  });
});
