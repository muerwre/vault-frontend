import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Work queue for the media fetcher. */
export class CreateMediaJob1794800000002 implements MigrationInterface {
  name = 'CreateMediaJob1794800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE \`media_job\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`kind\` varchar(16) NOT NULL,
  \`media_id\` int(10) unsigned DEFAULT NULL,
  \`file_id\` int(11) DEFAULT NULL,
  \`status\` varchar(16) NOT NULL DEFAULT 'queued',
  \`priority\` smallint(5) unsigned NOT NULL DEFAULT 0,
  \`progress\` smallint(5) unsigned NOT NULL DEFAULT 0,
  \`attempts\` smallint(5) unsigned NOT NULL DEFAULT 0,
  \`next_attempt_at\` timestamp NULL DEFAULT NULL,
  \`last_error\` text DEFAULT NULL,
  \`lease_owner\` varchar(64) DEFAULT NULL,
  \`lease_until\` timestamp NULL DEFAULT NULL,
  \`payload\` text DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  \`finished_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_media_job_claim\` (\`status\`,\`kind\`,\`priority\`,\`id\`),
  KEY \`idx_media_job_media\` (\`media_id\`),
  KEY \`idx_media_job_file\` (\`file_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `media_job`');
  }
}
