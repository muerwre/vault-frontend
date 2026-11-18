import {
  REGISTRATION_DELIVERIES,
  type RegistrationDelivery,
  type RegistrationStatus,
} from '@vault/common/constants';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TIMESTAMP_NULLABLE } from './columns';

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
 * A guest's request for an account, one per email. Lives on after the user is
 * created, as `completed`, so the same address is never invited twice.
 */
@Entity('registration_request')
@Index('idx_registration_request_due', ['delivery', 'nextAttemptAt'])
export class RegistrationRequest {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  /** Trimmed and lower-cased. */
  @Index('uq_registration_request_email', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', length: 16 })
  status: RegistrationStatus;

  /** Issued on approval; the link carries it. */
  @Index('uq_registration_request_code', { unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  /** Set by the first successful send, so failed attempts do not shorten it. */
  @Column({ name: 'code_expires_at', ...TIMESTAMP_NULLABLE })
  codeExpiresAt: Date | null;

  @Column({
    type: 'varchar',
    length: 16,
    default: REGISTRATION_DELIVERIES.NONE,
  })
  delivery: RegistrationDelivery;

  /** Failed sends since the last success or admin retry. */
  @Column({
    name: 'send_attempts',
    type: 'smallint',
    unsigned: true,
    default: 0,
  })
  sendAttempts: number;

  @Column({ name: 'next_attempt_at', ...TIMESTAMP_NULLABLE })
  nextAttemptAt: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError: string | null;

  @Column({ name: 'last_sent_at', ...TIMESTAMP_NULLABLE })
  lastSentAt: Date | null;

  /** Last time the guest submitted the form; drives the hourly limit. */
  @Column({ name: 'requested_at', ...TIMESTAMP_NULLABLE })
  requestedAt: Date | null;

  @Column({ name: 'decided_by', type: 'int', nullable: true })
  decidedBy: number | null;

  @Column({ name: 'decided_at', ...TIMESTAMP_NULLABLE })
  decidedAt: Date | null;

  /** The account created from this request. */
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @CreateDateColumn(CREATED_AT)
  createdAt: Date;

  @UpdateDateColumn(UPDATED_AT)
  updatedAt: Date;
}
