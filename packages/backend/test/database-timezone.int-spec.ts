import type { INestApplication } from '@nestjs/common';
import type { DataSource } from 'typeorm';

import { createTestApp, getDataSource } from './helpers/app';

describe('database sessions (integration)', () => {
  let app: INestApplication;
  let db: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    db = getDataSource(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('run in UTC on every pooled connection, whatever the server zone', async () => {
    // Held at once, so the pool has to open several connections.
    const runners = Array.from({ length: 5 }, () => db.createQueryRunner());

    try {
      await Promise.all(runners.map((runner) => runner.connect()));

      const zones = await Promise.all(
        runners.map(
          async (runner) =>
            (await runner.query(
              'SELECT @@session.time_zone AS zone, TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), NOW()) AS skew',
            )) as Array<{ zone: string; skew: string | number }>,
        ),
      );

      for (const [row] of zones) {
        expect(row.zone).toBe('+00:00');
        expect(Number(row.skew)).toBe(0);
      }
    } finally {
      await Promise.all(runners.map((runner) => runner.release()));
    }
  });

  it('reads back what NOW() stamps as the current moment', async () => {
    const [row] = (await db.query('SELECT NOW() AS now')) as Array<{
      now: Date;
    }>;

    expect(Math.abs(row.now.getTime() - Date.now())).toBeLessThan(5_000);
  });
});
