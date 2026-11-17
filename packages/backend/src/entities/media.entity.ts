import {
  MEDIA_KINDS,
  MEDIA_SOURCE_STATUSES,
  MEDIA_THUMB_STATUSES,
  MEDIA_VIDEO_STATUSES,
  MEDIA_JOB_STATUSES,
  type MediaJobKind,
  type MediaJobStatus,
  type MediaKind,
  type MediaOwnerType,
  type MediaProvider,
  type MediaItemSkipReason,
  type MediaSourceStatus,
  type MediaThumbStatus,
  type MediaVideoStatus,
} from '@vault/common/media';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type ValueTransformer,
} from 'typeorm';

import { jsonTransformer, TIMESTAMP_NULLABLE } from './columns';

/** `bigint` arrives as a string (`bigNumberStrings`); these values fit a double. */
const bigintNumber: ValueTransformer = {
  to: (value: number | null | undefined) => value ?? null,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

/** Whole seconds, so the default must not carry a fractional precision either. */
const CREATED_AT = {
  name: 'created_at',
  type: 'timestamp',
  precision: 0,
  default: () => 'CURRENT_TIMESTAMP',
} as const;

const UPDATED_AT = {
  ...CREATED_AT,
  name: 'updated_at',
  onUpdate: 'CURRENT_TIMESTAMP',
} as const;

/**
 * One external item, such as a YouTube video, with the state of our local
 * copies of it. Shared by every node and comment that links it.
 */
@Entity('external_media')
@Index('uq_external_media_provider_external_id', ['provider', 'externalId'], {
  unique: true,
})
@Index('idx_external_media_planning', ['videoStatus', 'priority'])
export class ExternalMedia {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32 })
  provider: MediaProvider;

  @Column({ name: 'external_id', type: 'varchar', length: 64 })
  externalId: string;

  @Column({ type: 'varchar', length: 16, default: MEDIA_KINDS.UNKNOWN })
  kind: MediaKind;

  @Column({
    name: 'video_status',
    type: 'varchar',
    length: 16,
    default: MEDIA_VIDEO_STATUSES.NONE,
  })
  videoStatus: MediaVideoStatus;

  @Column({ name: 'skip_reason', type: 'varchar', length: 16, nullable: true })
  skipReason: MediaItemSkipReason | null;

  @Column({
    name: 'thumb_status',
    type: 'varchar',
    length: 16,
    default: MEDIA_THUMB_STATUSES.NONE,
  })
  thumbStatus: MediaThumbStatus;

  /** Lowest priority of anything that references it; lower runs first. */
  @Column({ type: 'smallint', unsigned: true, default: 0 })
  priority: number;

  /** The downloaded copy, a `file` row, once ready. */
  @Column({ name: 'video_file_id', type: 'int', nullable: true })
  videoFileId: number | null;

  /** Relative to the uploads root. */
  @Column({ name: 'thumb_path', type: 'varchar', length: 255, nullable: true })
  thumbPath: string | null;

  /** Seconds. */
  @Column({ type: 'int', unsigned: true, nullable: true })
  duration: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  width: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  height: number | null;

  @Column({
    name: 'estimated_bytes',
    type: 'bigint',
    unsigned: true,
    nullable: true,
    transformer: bigintNumber,
  })
  estimatedBytes: number | null;

  /** Whether the provider can still play the original. */
  @Column({
    name: 'source_status',
    type: 'varchar',
    length: 16,
    default: MEDIA_SOURCE_STATUSES.UNKNOWN,
  })
  sourceStatus: MediaSourceStatus;

  @Column({ name: 'source_checked_at', ...TIMESTAMP_NULLABLE })
  sourceCheckedAt: Date | null;

  @CreateDateColumn(CREATED_AT)
  createdAt: Date;

  @UpdateDateColumn(UPDATED_AT)
  updatedAt: Date;
}

/** A node or comment linking an {@link ExternalMedia} item. */
@Entity('external_media_ref')
@Index('uq_external_media_ref', ['mediaId', 'ownerType', 'ownerId'], {
  unique: true,
})
@Index('idx_external_media_ref_owner', ['ownerType', 'ownerId'])
export class ExternalMediaRef {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'media_id', type: 'int', unsigned: true })
  mediaId: number;

  @Column({ name: 'owner_type', type: 'varchar', length: 16 })
  ownerType: MediaOwnerType;

  @Column({ name: 'owner_id', type: 'int' })
  ownerId: number;

  @CreateDateColumn(CREATED_AT)
  createdAt: Date;
}

/** Work for the media fetcher. The table is the queue. */
@Entity('media_job')
@Index('idx_media_job_claim', ['status', 'kind', 'priority', 'id'])
@Index('idx_media_job_media', ['mediaId'])
@Index('idx_media_job_file', ['fileId'])
export class MediaJob {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 16 })
  kind: MediaJobKind;

  @Column({ name: 'media_id', type: 'int', unsigned: true, nullable: true })
  mediaId: number | null;

  @Column({ name: 'file_id', type: 'int', nullable: true })
  fileId: number | null;

  @Column({
    type: 'varchar',
    length: 16,
    default: MEDIA_JOB_STATUSES.QUEUED,
  })
  status: MediaJobStatus;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  priority: number;

  /** 0–100. */
  @Column({ type: 'smallint', unsigned: true, default: 0 })
  progress: number;

  @Column({ type: 'smallint', unsigned: true, default: 0 })
  attempts: number;

  @Column({ name: 'next_attempt_at', ...TIMESTAMP_NULLABLE })
  nextAttemptAt: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'lease_owner', type: 'varchar', length: 64, nullable: true })
  leaseOwner: string | null;

  @Column({ name: 'lease_until', ...TIMESTAMP_NULLABLE })
  leaseUntil: Date | null;

  @Column({
    type: 'text',
    nullable: true,
    transformer: jsonTransformer<Record<string, unknown>>({}),
  })
  payload: Record<string, unknown> | null;

  @CreateDateColumn(CREATED_AT)
  createdAt: Date;

  @UpdateDateColumn(UPDATED_AT)
  updatedAt: Date;

  @Column({ name: 'finished_at', ...TIMESTAMP_NULLABLE })
  finishedAt: Date | null;
}
