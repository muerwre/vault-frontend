import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { legacyVarchar, TIMESTAMP_NULLABLE } from './columns';
import { User } from './user.entity';

/**
 * Legacy stateful sessions. **Not used for authentication** — auth is stateless
 * JWT, and this table is retained only so the baseline migration fully describes
 * the schema. Do not resurrect DB-backed sessions from it.
 */
@Entity('token')
export class Token {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index('IDX_d9959ee7e17e2293893444ea37', { unique: true })
  @Column(legacyVarchar())
  token: string;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'created_at', ...TIMESTAMP_NULLABLE })
  createdAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_94f168faad896c0786646fa3d4a',
  })
  user: User | null;
}
