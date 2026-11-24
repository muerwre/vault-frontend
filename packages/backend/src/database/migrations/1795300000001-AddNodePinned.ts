import type { MigrationInterface, QueryRunner } from 'typeorm';

/** The author's pin: a pinned node leads their profile, wherever it is listed. */
export class AddNodePinned1795300000001 implements MigrationInterface {
  name = 'AddNodePinned1795300000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`node\`
        ADD COLUMN \`is_pinned\` tinyint(4) NOT NULL DEFAULT 0 AFTER \`is_heroic\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`node\` DROP COLUMN \`is_pinned\``);
  }
}
