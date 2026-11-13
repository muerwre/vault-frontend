import type { QueryRunner } from 'typeorm';

import { BaselineSchema1721000000000 } from './migrations/1721000000000-BaselineSchema';

/** Records the statements a revert would run, without a database. */
const recordingRunner = () => {
  const queries: string[] = [];

  return {
    queries,
    runner: {
      query: async (sql: string) => {
        queries.push(sql);
      },
    },
  };
};

describe('baseline revert', () => {
  const saved = process.env.BASELINE_DROP_EVERYTHING;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.BASELINE_DROP_EVERYTHING;
    } else {
      process.env.BASELINE_DROP_EVERYTHING = saved;
    }
  });

  /**
   * The baseline adopts a populated database instead of creating one, so a
   * revert would drop tables it never made — production's included.
   */
  it('refuses to drop anything by default', async () => {
    delete process.env.BASELINE_DROP_EVERYTHING;
    const { queries, runner } = recordingRunner();

    await expect(
      new BaselineSchema1721000000000().down(runner as unknown as QueryRunner),
    ).rejects.toThrow(/Refusing to revert/);
    expect(queries).toHaveLength(0);
  });

  it('is not unlocked by a merely truthy value', async () => {
    process.env.BASELINE_DROP_EVERYTHING = 'true';
    const { queries, runner } = recordingRunner();

    await expect(
      new BaselineSchema1721000000000().down(runner as unknown as QueryRunner),
    ).rejects.toThrow(/Refusing to revert/);
    expect(queries).toHaveLength(0);
  });

  it('drops every table when explicitly confirmed', async () => {
    process.env.BASELINE_DROP_EVERYTHING = 'yes-drop-every-table';
    const { queries, runner } = recordingRunner();

    await new BaselineSchema1721000000000().down(
      runner as unknown as QueryRunner,
    );

    const drops = queries.filter((q) => q.startsWith('DROP TABLE'));
    // Every table the baseline knows about, and nothing left behind.
    expect(drops.length).toBeGreaterThan(20);
    expect(new Set(drops).size).toBe(drops.length);
  });
});
