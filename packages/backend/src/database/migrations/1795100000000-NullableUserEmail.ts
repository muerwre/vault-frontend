import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Lets `user.email` be `NULL` and turns every empty email into one, so a
 * unique index can cover the column.
 */
export class NullableUserEmail1795100000000 implements MigrationInterface {
  name = 'NullableUserEmail1795100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user` MODIFY `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NULL DEFAULT NULL',
    );
    await queryRunner.query(
      "UPDATE `user` SET `email` = NULLIF(TRIM(`email`), '')",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `user` SET `email` = '' WHERE `email` IS NULL",
    );
    await queryRunner.query(
      'ALTER TABLE `user` MODIFY `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL',
    );
  }
}
