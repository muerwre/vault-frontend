import { ROLES, type Role } from '@vault/common/constants';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  LEGACY_CHARSET,
  LEGACY_DATETIME_NULLABLE,
  LEGACY_TIMESTAMP,
  legacyBool,
  legacyText,
  legacyVarchar,
  TIMESTAMP_NULLABLE,
} from './columns';
import { File } from './file.entity';

/**
 * Legacy dialect. There is no `last_seen_boris` column — the API field of that
 * name is derived server-side.
 */
@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index('IDX_78a916df40e02a9deb1c4b75ed', { unique: true })
  @Column(legacyVarchar())
  username: string;

  /**
   * Three hash formats coexist and all must keep validating: bcrypt `$2a$`,
   * bcrypt `$2b$` and bare MD5 hex. The literal `NO_PASSWORD` sentinel marks an
   * OAuth-only account and must never authenticate. Never serialise this column.
   */
  @Column(legacyVarchar())
  password: string;

  @Column(legacyVarchar())
  email: string;

  @Column({
    type: 'enum',
    enum: [ROLES.USER, ROLES.GUEST, ROLES.ADMIN],
    default: ROLES.USER,
    nullable: false,
    ...LEGACY_CHARSET,
  })
  role: Role;

  /** `tinyint(4)`, not a string. */
  @Column({ name: 'is_activated', ...legacyBool(0) })
  isActivated: boolean;

  @Column({ name: 'last_seen', ...LEGACY_DATETIME_NULLABLE })
  lastSeen: Date | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Column({ name: 'coverId', type: 'int', nullable: true })
  coverId: number | null;

  @Column({ name: 'photoId', type: 'int', nullable: true })
  photoId: number | null;

  @Column(legacyVarchar({ nullable: true }))
  fullname: string | null;

  @Column(legacyText({ nullable: true }))
  description: string | null;

  @Column({ name: 'last_seen_messages', ...LEGACY_DATETIME_NULLABLE })
  lastSeenMessages: Date | null;

  @Column({ name: 'last_seen_notifications', ...TIMESTAMP_NULLABLE })
  lastSeenNotifications: Date | null;

  /** Retro-added as `timestamp`, unlike the other legacy date columns. */
  @Index('idx_user_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;

  /**
   * Photo and cover are one-to-one: both columns carry a unique constraint.
   * Eager-loaded because every `WithUser` route serialises the avatar.
   */
  @OneToOne(() => File, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'photoId',
    foreignKeyConstraintName: 'FK_75e2be4ce11d447ef43be0e374f',
  })
  photo: File | null;

  @OneToOne(() => File, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'coverId',
    foreignKeyConstraintName: 'FK_31ee09e17ab6f824cae374e8cb4',
  })
  cover: File | null;
}
