import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes `user.email` unique. Refuses to run while two accounts share an
 * address — the error lists them, and they must be resolved by hand.
 */
export class UniqueUserEmail1795100000001 implements MigrationInterface {
  name = 'UniqueUserEmail1795100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The column's collation is case-insensitive, as the index will be.
    const duplicates: { email: string; ids: string }[] =
      await queryRunner.query(`
SELECT \`email\`, GROUP_CONCAT(\`id\` ORDER BY \`id\`) AS \`ids\`
FROM \`user\`
WHERE \`email\` IS NOT NULL
GROUP BY \`email\`
HAVING COUNT(*) > 1
      `);

    if (duplicates.length > 0) {
      const list = duplicates
        .map((row) => `${row.email} (users ${row.ids})`)
        .join(', ');

      throw new Error(`user.email has duplicates, resolve them first: ${list}`);
    }

    await queryRunner.query(
      'CREATE UNIQUE INDEX `uq_user_email` ON `user` (`email`)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `uq_user_email` ON `user`');
  }
}
