import type { OAuthProvider } from '@vault/common/constants';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LEGACY_TIMESTAMP, legacyVarchar } from './columns';
import { User } from './user.entity';

/**
 * `social` — a linked OAuth account. Legacy dialect.
 *
 * The wire DTO renames these columns: `account_id` → `id`,
 * `account_name` → `name`, `account_photo` → `photo`, and hides `id`/`userId`.
 */
@Entity('social')
export class Social {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyVarchar())
  provider: OAuthProvider;

  @Column({ name: 'account_id', ...legacyVarchar() })
  accountId: string;

  @Column({ name: 'account_name', ...legacyVarchar({ nullable: true }) })
  accountName: string | null;

  @Column({ name: 'account_photo', ...legacyVarchar({ nullable: true }) })
  accountPhoto: string | null;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_4cda297c26dea7a3b8d08b9ba18',
  })
  user: User | null;
}

/** `restore_code` — password-reset codes. Legacy dialect, `created_at` only. */
@Entity('restore_code')
export class RestoreCode {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyVarchar())
  code: string;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_669b3600ee64af20658316527bc',
  })
  user: User | null;
}
