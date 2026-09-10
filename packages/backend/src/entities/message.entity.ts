import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  filesOrderTransformer,
  LEGACY_DATETIME_NULLABLE,
  LEGACY_TIMESTAMP,
  legacyText,
} from './columns';
import { File } from './file.entity';
import { User } from './user.entity';

/**
 * Legacy dialect. FULLTEXT index on `text`.
 *
 * A "note" is a self-message (`fromId === toId`); there is no separate table.
 */
@Entity('message')
@Index('IDX_5e732355048e135674f657e595', ['text'], { fulltext: true })
export class Message {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyText({ nullable: false }))
  text: string;

  @Column({
    name: 'files_order',
    ...legacyText({ nullable: false }),
    transformer: filesOrderTransformer,
  })
  filesOrder: number[];

  @Column({ name: 'fromId', type: 'int', nullable: true })
  fromId: number | null;

  @Column({ name: 'toId', type: 'int', nullable: true })
  toId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Index('idx_message_deleted_at')
  @Column({ name: 'deleted_at', ...LEGACY_DATETIME_NULLABLE })
  deletedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'fromId',
    foreignKeyConstraintName: 'FK_776000050f42ddb61d3c628ff16',
  })
  from: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'toId',
    foreignKeyConstraintName: 'FK_69b470efb1b19aca6e781214490',
  })
  to: User | null;

  @ManyToMany(() => File, (file) => file.messages, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'message_files_file',
    joinColumn: {
      name: 'messageId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_243acfb9a9e56c28c9f43055c76',
    },
    inverseJoinColumn: {
      name: 'fileId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_fc56b6b90ec366b402fc86bbe41',
    },
  })
  files: File[];
}
