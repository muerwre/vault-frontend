import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Guests' requests for an account, and the state of mailing their links. */
export class CreateRegistrationRequest1795100000002
  implements MigrationInterface
{
  name = 'CreateRegistrationRequest1795100000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE \`registration_request\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`email\` varchar(255) NOT NULL,
  \`reason\` text DEFAULT NULL,
  \`status\` varchar(16) NOT NULL,
  \`code\` varchar(64) DEFAULT NULL,
  \`code_expires_at\` timestamp NULL DEFAULT NULL,
  \`delivery\` varchar(16) NOT NULL DEFAULT 'none',
  \`send_attempts\` smallint(5) unsigned NOT NULL DEFAULT 0,
  \`next_attempt_at\` timestamp NULL DEFAULT NULL,
  \`last_error\` text DEFAULT NULL,
  \`last_sent_at\` timestamp NULL DEFAULT NULL,
  \`requested_at\` timestamp NULL DEFAULT NULL,
  \`decided_by\` int(11) DEFAULT NULL,
  \`decided_at\` timestamp NULL DEFAULT NULL,
  \`user_id\` int(11) DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_registration_request_email\` (\`email\`),
  UNIQUE KEY \`uq_registration_request_code\` (\`code\`),
  KEY \`idx_registration_request_due\` (\`delivery\`,\`next_attempt_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `registration_request`');
  }
}
