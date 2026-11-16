import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Which node or comment links which external item. */
export class CreateExternalMediaRef1794800000001 implements MigrationInterface {
  name = 'CreateExternalMediaRef1794800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE \`external_media_ref\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`media_id\` int(10) unsigned NOT NULL,
  \`owner_type\` varchar(16) NOT NULL,
  \`owner_id\` int(11) NOT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_external_media_ref\` (\`media_id\`,\`owner_type\`,\`owner_id\`),
  KEY \`idx_external_media_ref_owner\` (\`owner_type\`,\`owner_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `external_media_ref`');
  }
}
