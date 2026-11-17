import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Whether an item's original can still be played from its provider. */
export class AddExternalMediaSource1794900000000 implements MigrationInterface {
  name = 'AddExternalMediaSource1794900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`external_media\`
        ADD COLUMN \`source_status\` varchar(16) NOT NULL DEFAULT 'unknown' AFTER \`estimated_bytes\`,
        ADD COLUMN \`source_checked_at\` timestamp NULL DEFAULT NULL AFTER \`source_status\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`external_media\`
        DROP COLUMN \`source_checked_at\`,
        DROP COLUMN \`source_status\`
    `);
  }
}
