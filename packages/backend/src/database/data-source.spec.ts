import { dataSourceOptions } from './data-source';

describe('data source', () => {
  /**
   * The schema mixes charsets, int widths and timestamp types that entity
   * metadata cannot express, so letting TypeORM reconcile it would ALTER live
   * columns and drop the FULLTEXT indexes search depends on.
   */
  it('never synchronises the schema from entities', () => {
    expect(dataSourceOptions.synchronize).toBe(false);
  });

  /** Applied on connect, so a deploy cannot leave the schema behind the code. */
  it('applies pending migrations on connect', () => {
    expect(dataSourceOptions.migrationsRun).toBe(true);
  });

  /**
   * The glob has to match compiled migrations too: the container has no
   * TypeScript, so in `dist` only the `.js` copies exist.
   */
  it('finds migrations as both sources and compiled output', () => {
    const [pattern] = dataSourceOptions.migrations as string[];

    expect(pattern).toContain('.ts');
    expect(pattern).toContain('.js');
  });
});
