import type { EmbedMetadata } from '@vault/common/types';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { jsonTransformer, LEGACY_TIMESTAMP, TIMESTAMP_NULLABLE } from './columns';

/** This table's own charset, unlike either other dialect. */
const EMBED_CHARSET = {
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
} as const;

/**
 * Cache of external media metadata, looked up by `(provider, address)` — which
 * has **no unique index**, so lookups must tolerate duplicates.
 */
@Entity('embed')
export class Embed {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false, ...EMBED_CHARSET })
  provider: string;

  @Column({ type: 'varchar', length: 255, nullable: false, ...EMBED_CHARSET })
  address: string;

  @Column({
    type: 'text',
    nullable: true,
    ...EMBED_CHARSET,
    transformer: jsonTransformer<EmbedMetadata>({}),
  })
  metadata: EmbedMetadata | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Index('idx_embed_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;
}
