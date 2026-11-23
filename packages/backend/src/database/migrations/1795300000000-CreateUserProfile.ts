import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Profile page content, kept apart from the legacy `user` table: the about
 * text, the size of its card and the user's external links. Idempotent: some
 * databases ran it under an earlier timestamp.
 */
export class CreateUserProfile1795300000000 implements MigrationInterface {
  name = 'CreateUserProfile1795300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE TABLE IF NOT EXISTS \`user_profile\` (
  \`userId\` int(11) NOT NULL,
  \`about\` text DEFAULT NULL,
  \`about_display\` varchar(16) DEFAULT NULL,
  \`links\` text DEFAULT NULL,
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (\`userId\`),
  CONSTRAINT \`fk_user_profile_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `user_profile`');
  }
}
