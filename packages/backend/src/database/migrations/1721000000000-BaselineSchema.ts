import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline schema, establishing a migration history for a database that had none.
 *
 * Idempotent by design:
 * - Against a populated database it only records itself as applied, and must
 *   never ALTER an existing column.
 * - Against an empty one (CI, e2e, a fresh machine) it creates the full schema.
 *
 * Raw SQL rather than generated output, because entity metadata cannot express
 * `tinyint` display widths or signed vs unsigned key widths.
 *
 * **Do not tidy this SQL.** The mixed utf8mb3/utf8mb4 charsets, the snake_case
 * `node_social_publications.node_id`, the dead tables and the missing unique
 * indexes are all faithful to the live schema. Verify with `yarn schema:drift`.
 */
export class BaselineSchema1721000000000 implements MigrationInterface {
  name = 'BaselineSchema1721000000000';

  /**
   * Every table this baseline describes. Used both to detect an already-populated
   * database and to drive `down()`.
   */
  private static readonly TABLES = [
  'app_notifications',
  'comment',
  'comment_files_file',
  'comment_likes',
  'comment_user_likes',
  'embed',
  'file',
  'like',
  'message',
  'message_files_file',
  'message_view',
  'node',
  'node_files_file',
  'node_social_publications',
  'node_tags_tag',
  'node_view',
  'node_watch',
  'notification_settings',
  'notifications',
  'restore_code',
  'social',
  'tag',
  'token',
  'user',
  'user_notifications',
  'user_notifications_processed',
  'user_notifications_sent',
  ];

  private static readonly CREATE_TABLE_SQL = [
  // ---- app_notifications -------------------------------------------------
  `
CREATE TABLE \`app_notifications\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`app\` varchar(255) DEFAULT NULL,
  \`type\` varchar(255) DEFAULT NULL,
  \`item_id\` int(10) unsigned DEFAULT NULL,
  \`sent_at\` timestamp NULL DEFAULT NULL,
  \`item_created_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_app_notifications_deleted_at\` (\`deleted_at\`),
  KEY \`item_id\` (\`item_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- comment -----------------------------------------------------------
  `
CREATE TABLE \`comment\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`files_order\` text COLLATE utf8mb3_unicode_ci NOT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`userId\` int(11) DEFAULT NULL,
  \`nodeId\` int(11) DEFAULT NULL,
  \`deleted_at\` datetime DEFAULT NULL,
  \`text\` text COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_c0354a9a009d3bb45a08655ce3b\` (\`userId\`),
  KEY \`FK_820b0cced48de62eeb991c6e794\` (\`nodeId\`),
  KEY \`idx_comment_deleted_at\` (\`deleted_at\`),
  FULLTEXT KEY \`IDX_84eaa1e0d08e574fb78fd3c9b3\` (\`text\`),
  CONSTRAINT \`FK_820b0cced48de62eeb991c6e794\` FOREIGN KEY (\`nodeId\`) REFERENCES \`node\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- comment_files_file ------------------------------------------------
  `
CREATE TABLE \`comment_files_file\` (
  \`commentId\` int(11) NOT NULL,
  \`fileId\` int(11) NOT NULL,
  PRIMARY KEY (\`commentId\`,\`fileId\`),
  KEY \`IDX_3e8c49a01afb50951d6cd0e0b0\` (\`commentId\`),
  KEY \`IDX_ea6a49b254c2a9f60fae7ae641\` (\`fileId\`),
  CONSTRAINT \`FK_3e8c49a01afb50951d6cd0e0b00\` FOREIGN KEY (\`commentId\`) REFERENCES \`comment\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_ea6a49b254c2a9f60fae7ae641b\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- comment_likes -----------------------------------------------------
  `
CREATE TABLE \`comment_likes\` (
  \`user_id\` int(10) unsigned NOT NULL,
  \`userId\` int(10) unsigned NOT NULL,
  PRIMARY KEY (\`user_id\`,\`userId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- comment_user_likes ------------------------------------------------
  `
CREATE TABLE \`comment_user_likes\` (
  \`commentId\` int(10) unsigned NOT NULL,
  \`userId\` int(10) unsigned NOT NULL,
  PRIMARY KEY (\`commentId\`,\`userId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- embed -------------------------------------------------------------
  `
CREATE TABLE \`embed\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`provider\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`address\` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  \`metadata\` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_embed_deleted_at\` (\`deleted_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `,
  // ---- file --------------------------------------------------------------
  `
CREATE TABLE \`file\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`orig_name\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`path\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`full_path\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`url\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`size\` int(11) NOT NULL,
  \`type\` enum('image','text','audio','video') COLLATE utf8mb3_unicode_ci NOT NULL,
  \`mime\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`metadata\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`userId\` int(11) DEFAULT NULL,
  \`target\` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_b2d8e683f020f61115edea206b3\` (\`userId\`),
  KEY \`idx_file_deleted_at\` (\`deleted_at\`),
  CONSTRAINT \`FK_b2d8e683f020f61115edea206b3\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- like --------------------------------------------------------------
  `
CREATE TABLE \`like\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`userId\` int(11) DEFAULT NULL,
  \`nodeId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_e8fb739f08d47955a39850fac23\` (\`userId\`),
  KEY \`FK_9ebadab2ba5f1e8f092fb119a45\` (\`nodeId\`),
  CONSTRAINT \`FK_9ebadab2ba5f1e8f092fb119a45\` FOREIGN KEY (\`nodeId\`) REFERENCES \`node\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_e8fb739f08d47955a39850fac23\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- message -----------------------------------------------------------
  `
CREATE TABLE \`message\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`text\` text COLLATE utf8mb3_unicode_ci NOT NULL,
  \`files_order\` text COLLATE utf8mb3_unicode_ci NOT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`deleted_at\` datetime DEFAULT NULL,
  \`fromId\` int(11) DEFAULT NULL,
  \`toId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_776000050f42ddb61d3c628ff16\` (\`fromId\`),
  KEY \`FK_69b470efb1b19aca6e781214490\` (\`toId\`),
  KEY \`idx_message_deleted_at\` (\`deleted_at\`),
  FULLTEXT KEY \`IDX_5e732355048e135674f657e595\` (\`text\`),
  CONSTRAINT \`FK_69b470efb1b19aca6e781214490\` FOREIGN KEY (\`toId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT \`FK_776000050f42ddb61d3c628ff16\` FOREIGN KEY (\`fromId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- message_files_file ------------------------------------------------
  `
CREATE TABLE \`message_files_file\` (
  \`messageId\` int(11) NOT NULL,
  \`fileId\` int(11) NOT NULL,
  PRIMARY KEY (\`messageId\`,\`fileId\`),
  KEY \`IDX_243acfb9a9e56c28c9f43055c7\` (\`messageId\`),
  KEY \`IDX_fc56b6b90ec366b402fc86bbe4\` (\`fileId\`),
  CONSTRAINT \`FK_243acfb9a9e56c28c9f43055c76\` FOREIGN KEY (\`messageId\`) REFERENCES \`message\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_fc56b6b90ec366b402fc86bbe41\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- message_view ------------------------------------------------------
  `
CREATE TABLE \`message_view\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`viewed\` datetime NOT NULL DEFAULT current_timestamp(),
  \`dialogId\` int(11) DEFAULT NULL,
  \`userId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_81d1e3edf061df94b2668ba798\` (\`dialogId\`,\`userId\`),
  KEY \`FK_abbf1dbfd3ca847b1ade4ab3011\` (\`userId\`),
  CONSTRAINT \`FK_abbf1dbfd3ca847b1ade4ab3011\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_f72b3a46e2a6dd4ef146ebdb755\` FOREIGN KEY (\`dialogId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- node --------------------------------------------------------------
  `
CREATE TABLE \`node\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`type\` enum('image','audio','video','text','webm','boris') COLLATE utf8mb3_unicode_ci NOT NULL,
  \`blocks\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`files_order\` text COLLATE utf8mb3_unicode_ci NOT NULL,
  \`is_public\` tinyint(4) NOT NULL DEFAULT 1,
  \`is_promoted\` tinyint(4) NOT NULL DEFAULT 1,
  \`commented_at\` datetime DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`coverId\` int(11) DEFAULT NULL,
  \`userId\` int(11) DEFAULT NULL,
  \`deleted_at\` datetime DEFAULT NULL,
  \`thumbnail\` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`description\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`flow\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`is_heroic\` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`REL_eb77c38da6d87500c1e84ffbcf\` (\`coverId\`),
  KEY \`FK_49e3f89e68914252136980d77ac\` (\`userId\`),
  KEY \`idx_node_deleted_at\` (\`deleted_at\`),
  FULLTEXT KEY \`IDX_7204c77952e8c70fc6c0d5e26b\` (\`title\`),
  FULLTEXT KEY \`IDX_4ca96324484c7a3d16aa993cad\` (\`description\`),
  CONSTRAINT \`FK_49e3f89e68914252136980d77ac\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT \`FK_eb77c38da6d87500c1e84ffbcf7\` FOREIGN KEY (\`coverId\`) REFERENCES \`file\` (\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- node_files_file ---------------------------------------------------
  `
CREATE TABLE \`node_files_file\` (
  \`nodeId\` int(11) NOT NULL,
  \`fileId\` int(11) NOT NULL,
  PRIMARY KEY (\`nodeId\`,\`fileId\`),
  KEY \`IDX_8ffb7320092a62cfa9a37305ff\` (\`nodeId\`),
  KEY \`IDX_021adde0193f016a96f9add519\` (\`fileId\`),
  CONSTRAINT \`FK_021adde0193f016a96f9add5196\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_8ffb7320092a62cfa9a37305ff2\` FOREIGN KEY (\`nodeId\`) REFERENCES \`node\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- node_social_publications ------------------------------------------
  `
CREATE TABLE \`node_social_publications\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`node_id\` int(10) unsigned DEFAULT NULL,
  \`provider\` varchar(255) DEFAULT NULL,
  \`link\` varchar(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_node_social_publications_deleted_at\` (\`deleted_at\`),
  KEY \`node_provider\` (\`node_id\`,\`provider\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- node_tags_tag -----------------------------------------------------
  `
CREATE TABLE \`node_tags_tag\` (
  \`nodeId\` int(11) NOT NULL,
  \`tagId\` int(11) NOT NULL,
  PRIMARY KEY (\`nodeId\`,\`tagId\`),
  KEY \`IDX_f93fb13785a5615177ff54eb34\` (\`nodeId\`),
  KEY \`IDX_2050877825e4558d76d4b21b7d\` (\`tagId\`),
  CONSTRAINT \`FK_2050877825e4558d76d4b21b7d1\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_f93fb13785a5615177ff54eb34b\` FOREIGN KEY (\`nodeId\`) REFERENCES \`node\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- node_view ---------------------------------------------------------
  `
CREATE TABLE \`node_view\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`visited\` datetime NOT NULL DEFAULT current_timestamp(),
  \`nodeId\` int(11) DEFAULT NULL,
  \`userId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_b9eef954a619229d26641e5e7d\` (\`nodeId\`,\`userId\`),
  KEY \`FK_4f3b0c25129817036a8b070a140\` (\`userId\`),
  CONSTRAINT \`FK_1c70e7abe9702b1d40f2bbd9bb0\` FOREIGN KEY (\`nodeId\`) REFERENCES \`node\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT \`FK_4f3b0c25129817036a8b070a140\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- node_watch --------------------------------------------------------
  `
CREATE TABLE \`node_watch\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`userId\` int(10) unsigned DEFAULT NULL,
  \`nodeId\` int(10) unsigned DEFAULT NULL,
  \`active\` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_node_watch_deleted_at\` (\`deleted_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- notification_settings ---------------------------------------------
  `
CREATE TABLE \`notification_settings\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`userId\` int(10) unsigned DEFAULT NULL,
  \`last_seen_notifications\` timestamp NULL DEFAULT NULL,
  \`subscribed_to_flow\` tinyint(1) DEFAULT NULL,
  \`subscribed_to_comments\` tinyint(1) DEFAULT 1,
  \`enabled\` tinyint(1) DEFAULT 1,
  \`last_seen\` timestamp NULL DEFAULT NULL,
  \`last_cleared\` timestamp NULL DEFAULT NULL,
  \`send_telegram\` tinyint(1) DEFAULT NULL,
  \`show_indicator\` tinyint(1) DEFAULT NULL,
  \`subscribed_to_boris\` tinyint(1) DEFAULT NULL,
  \`send_email\` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- notifications -----------------------------------------------------
  `
CREATE TABLE \`notifications\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`type\` varchar(255) DEFAULT NULL,
  \`itemId\` int(10) unsigned DEFAULT NULL,
  \`time\` timestamp NULL DEFAULT NULL,
  \`userId\` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_notifications_deleted_at\` (\`deleted_at\`),
  KEY \`item_id\` (\`itemId\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- restore_code ------------------------------------------------------
  `
CREATE TABLE \`restore_code\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`code\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`userId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_669b3600ee64af20658316527bc\` (\`userId\`),
  CONSTRAINT \`FK_669b3600ee64af20658316527bc\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- social ------------------------------------------------------------
  `
CREATE TABLE \`social\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`provider\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`account_id\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`userId\` int(11) DEFAULT NULL,
  \`account_name\` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`account_photo\` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_4cda297c26dea7a3b8d08b9ba18\` (\`userId\`),
  CONSTRAINT \`FK_4cda297c26dea7a3b8d08b9ba18\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- tag ---------------------------------------------------------------
  `
CREATE TABLE \`tag\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`title\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`data\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`userId\` int(11) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`FK_d0dc39ff83e384b4a097f47d3f5\` (\`userId\`),
  CONSTRAINT \`FK_d0dc39ff83e384b4a097f47d3f5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- token -------------------------------------------------------------
  `
CREATE TABLE \`token\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`token\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`userId\` int(11) DEFAULT NULL,
  \`created_at\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_d9959ee7e17e2293893444ea37\` (\`token\`),
  KEY \`FK_94f168faad896c0786646fa3d4a\` (\`userId\`),
  CONSTRAINT \`FK_94f168faad896c0786646fa3d4a\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- user --------------------------------------------------------------
  `
CREATE TABLE \`user\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`username\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`password\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`email\` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  \`role\` enum('user','guest','admin') COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'user',
  \`is_activated\` tinyint(4) NOT NULL DEFAULT 0,
  \`last_seen\` datetime DEFAULT NULL,
  \`created_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`updated_at\` datetime NOT NULL DEFAULT current_timestamp(),
  \`coverId\` int(11) DEFAULT NULL,
  \`photoId\` int(11) DEFAULT NULL,
  \`fullname\` varchar(255) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`description\` text COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  \`last_seen_messages\` datetime DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`last_seen_notifications\` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`),
  UNIQUE KEY \`REL_31ee09e17ab6f824cae374e8cb\` (\`coverId\`),
  UNIQUE KEY \`REL_75e2be4ce11d447ef43be0e374\` (\`photoId\`),
  KEY \`idx_user_deleted_at\` (\`deleted_at\`),
  CONSTRAINT \`FK_31ee09e17ab6f824cae374e8cb4\` FOREIGN KEY (\`coverId\`) REFERENCES \`file\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT \`FK_75e2be4ce11d447ef43be0e374f\` FOREIGN KEY (\`photoId\`) REFERENCES \`file\` (\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci
  `,
  // ---- user_notifications ------------------------------------------------
  `
CREATE TABLE \`user_notifications\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`created_at\` timestamp NULL DEFAULT NULL,
  \`updated_at\` timestamp NULL DEFAULT NULL,
  \`deleted_at\` timestamp NULL DEFAULT NULL,
  \`type\` varchar(255) DEFAULT NULL,
  \`itemId\` int(10) unsigned DEFAULT NULL,
  \`time\` timestamp NULL DEFAULT NULL,
  \`userId\` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`item_id\` (\`itemId\`),
  KEY \`idx_user_notifications_deleted_at\` (\`deleted_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- user_notifications_processed --------------------------------------
  `
CREATE TABLE \`user_notifications_processed\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`service\` varchar(255) NOT NULL,
  \`processed_at\` timestamp NULL DEFAULT NULL,
  \`notification_id\` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  // ---- user_notifications_sent -------------------------------------------
  `
CREATE TABLE \`user_notifications_sent\` (
  \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT,
  \`service\` varchar(255) NOT NULL,
  \`sent_at\` timestamp NULL DEFAULT NULL,
  \`notification_id\` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const existing = await BaselineSchema1721000000000.existingTables(queryRunner);

    if (existing.length > 0) {
      // Pre-existing database: recording this as applied is the whole point, so
      // later migrations run from a known starting state.
      if (existing.length !== BaselineSchema1721000000000.TABLES.length) {
        const missing = BaselineSchema1721000000000.TABLES.filter(
          t => !existing.includes(t),
        );
        throw new Error(
          `Refusing to apply the baseline to a partially-populated database. ` +
            `Found ${existing.length} of ${BaselineSchema1721000000000.TABLES.length} ` +
            `expected tables; missing: ${missing.join(', ')}. ` +
            `Create the missing tables by hand or start from an empty database.`,
        );
      }

      return;
    }

    // Foreign keys off so tables can be created in any order despite the
    // circular user↔file dependency.
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    try {
      for (const sql of BaselineSchema1721000000000.CREATE_TABLE_SQL) {
        await queryRunner.query(sql);
      }
    } finally {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

    try {
      for (const table of [...BaselineSchema1721000000000.TABLES].reverse()) {
        await queryRunner.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
    } finally {
      await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }

  private static async existingTables(queryRunner: QueryRunner): Promise<string[]> {
    const rows: Array<{ TABLE_NAME: string }> = await queryRunner.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${BaselineSchema1721000000000.TABLES.map(
         t => `'${t}'`,
       ).join(', ')})`,
    );

    return rows.map(r => r.TABLE_NAME);
  }
}
