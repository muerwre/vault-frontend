import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { MODERN_ID_NULLABLE, modernBool, TIMESTAMP_NULLABLE } from './columns';

/**
 * A node's cross-post links. Modern dialect.
 *
 * Table name is plural, and this is the **only** table whose FK column is
 * snake_case `node_id` rather than `nodeId`.
 *
 * Rows with `provider = 'vkontakte'` surface as node backlinks.
 */
@Entity('node_social_publications')
@Index('node_provider', ['nodeId', 'provider'])
export class NodeSocialPublication {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  /** snake_case by exception; see the class comment. */
  @Column({ name: 'node_id', ...MODERN_ID_NULLABLE })
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
 * Comment-thread subscriptions. Modern dialect.
 *
 * `(userId, nodeId)` has **no** unique index, so upserts must de-duplicate in
 * the query rather than rely on the database rejecting a second row.
 */
@Entity('node_watch')
export class NodeWatch {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'userId', ...MODERN_ID_NULLABLE })
  userId: number | null;

  @Column({ name: 'nodeId', ...MODERN_ID_NULLABLE })
  nodeId: number | null;

  @Column({ name: 'active', ...modernBool() })
  active: boolean | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @Column({ name: 'updated_at', ...TIMESTAMP_NULLABLE })
  updatedAt: Date | null;

  @Index('idx_node_watch_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}
