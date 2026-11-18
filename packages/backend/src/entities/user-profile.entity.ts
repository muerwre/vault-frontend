import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { jsonTransformer } from './columns';
import { User } from './user.entity';

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
 * Profile page content. At most one row per user, created on first save; a
 * missing row reads as an empty profile.
 */
@Entity('user_profile')
export class UserProfile {
  @PrimaryColumn({ name: 'userId', type: 'int' })
  userId: number;

  /** Long-form text for the big card on the profile page. Markdown. */
  @Column({ type: 'text', nullable: true })
  about: string | null;

  /**
   * Flow-cell size of the about card. Unset means the page default; never
   * trust it to be one of the known variants.
   */
  @Column({
    name: 'about_display',
    type: 'varchar',
    length: 16,
    nullable: true,
  })
  aboutDisplay: string | null;

  /** External links, as a JSON array of URLs. */
  @Column({
    type: 'text',
    nullable: true,
    transformer: jsonTransformer<string[]>(null),
  })
  links: string[] | null;

  @Column(CREATED_AT)
  createdAt: Date;

  @Column(UPDATED_AT)
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'fk_user_profile_user',
  })
  user: User;
}
