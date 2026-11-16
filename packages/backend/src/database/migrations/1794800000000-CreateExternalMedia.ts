import type { MigrationInterface, QueryRunner } from 'typeorm';

/** One row per external item (such as a YouTube video) and the state of our copies of it. */
export class CreateExternalMedia1794800000000 implements MigrationInterface {
  name = 'CreateExternalMedia1794800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE \`external_media\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`provider\` varchar(32) NOT NULL,
  \`external_id\` varchar(64) NOT NULL,
  \`kind\` varchar(16) NOT NULL DEFAULT 'unknown',
  \`video_status\` varchar(16) NOT NULL DEFAULT 'none',
  \`skip_reason\` varchar(16) DEFAULT NULL,
  \`thumb_status\` varchar(16) NOT NULL DEFAULT 'none',
  \`priority\` smallint(5) unsigned NOT NULL DEFAULT 0,
  \`video_file_id\` int(11) DEFAULT NULL,
  \`thumb_path\` varchar(255) DEFAULT NULL,
  \`duration\` int(10) unsigned DEFAULT NULL,
  \`width\` int(10) unsigned DEFAULT NULL,
  \`height\` int(10) unsigned DEFAULT NULL,
  \`estimated_bytes\` bigint(20) unsigned DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_external_media_provider_external_id\` (\`provider\`,\`external_id\`),
  KEY \`idx_external_media_planning\` (\`video_status\`,\`priority\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `external_media`');
  }
}
