/**
 * Prints the SQL TypeORM would run to make the database match the entities.
 * **Empty output means the entities describe the live schema exactly** — run this
 * after any entity change.
 *
 * Preferred over `typeorm schema:log`, which reports connection and metadata
 * errors as a silent exit 1.
 *
 * Usage: yarn schema:drift
 */
import { dataSource } from './data-source';

async function main() {
  await dataSource.initialize();

  try {
    const sqlInMemory = await dataSource.driver.createSchemaBuilder().log();

    const statements = [...sqlInMemory.upQueries.map((q) => q.query)];

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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
