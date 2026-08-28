import type { EmbedMetadata } from '@vault/common/types';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { jsonTransformer, LEGACY_TIMESTAMP, TIMESTAMP_NULLABLE } from './columns';

/**
 * `embed` — cache of external media metadata (YouTube), looked up by
 * `(provider, address)`.
 *
 * Its own charset dialect: `utf8mb4 / utf8mb4_unicode_ci` — neither the legacy
 * utf8mb3 tables nor the GORM tables' server-default collation.
 *
 * Note there is **no unique index** on `(provider, address)` in the live schema,
 * so the lookup must tolerate duplicates.
 */
const EMBED_CHARSET = {
  charset: 'utf8mb4',
  collation: 'utf8mb4_unicode_ci',
} as const;

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
