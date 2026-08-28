import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { GORM_ID_NULLABLE, gormBool, TIMESTAMP_NULLABLE } from './columns';

/**
 * `node_social_publications` — a node's cross-post links (29 rows). GORM dialect.
 *
 * ⚠️ Table name is **plural** (data-model.md calls it singular), and this is the
 * **only** table whose FK column is snake_case `node_id` rather than `nodeId`.
 * Preserve both exactly.
 *
 * Rows with `provider = 'vkontakte'` are surfaced as node backlinks.
 */
@Entity('node_social_publications')
@Index('node_provider', ['nodeId', 'provider'])
export class NodeSocialPublication {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  /** snake_case by exception — see the class comment. */
  @Column({ name: 'node_id', ...GORM_ID_NULLABLE })
  nodeId: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  provider: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  link: string | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_node_social_publications_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}

/**
 * `node_watch` — comment-thread subscriptions. GORM dialect, currently **empty**
 * (0 rows), so the write path is untested against real data.
 *
 * ⚠️ The live table has **no** unique index on `(userId, nodeId)`, contrary to
 * data-model.md. Upserts must therefore de-duplicate in the query, not rely on
 * the DB rejecting a second row.
 */
@Entity('node_watch')
export class NodeWatch {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'userId', ...GORM_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'nodeId', ...GORM_ID_NULLABLE })
  nodeId: number | null;

  @Column({ name: 'active', ...gormBool() })
  active: boolean | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_node_watch_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}
