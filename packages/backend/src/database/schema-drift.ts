/**
 * Prints the SQL TypeORM would run to make the live database match the entities.
 *
 * **Empty output is the compatibility proof** for Phase 1: it means the entities
 * describe the production schema exactly, so the app reads and writes the same
 * bytes the Go backend did.
 *
 * Exists alongside `typeorm schema:log` because the CLI swallows connection and
 * metadata errors (it exits 1 with no output), which makes the entity-tuning
 * loop impossible to debug.
 *
 * Usage: yarn schema:drift
 */
import { dataSource } from './data-source';

async function main() {
  await dataSource.initialize();

  try {
    const sqlInMemory = await dataSource.driver
      .createSchemaBuilder()
      .log();

    const statements = [
      ...sqlInMemory.upQueries.map(q => q.query),
    ];

    if (statements.length === 0) {
      console.log('✓ no drift — entities match the live schema exactly');
      return;
    }

    console.log(`✗ ${statements.length} statement(s) of drift:\n`);
    statements.forEach((query, i) => console.log(`${i + 1}. ${query};`));
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
