import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Per-node page settings as JSON, such as the song page layout. */
export class AddNodeSettings1795200000000 implements MigrationInterface {
  name = 'AddNodeSettings1795200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`node\`
        ADD COLUMN \`settings\` text CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NULL DEFAULT NULL AFTER \`flow\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`node\` DROP COLUMN \`settings\``);
  }
}
