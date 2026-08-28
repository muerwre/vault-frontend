import {
  FILE_TYPE_ENUM_ORDER,
  type FileType,
  type UploadTarget,
} from '@vault/common/constants';
import type { FileMetadata } from '@vault/common/types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  jsonTransformer,
  LEGACY_CHARSET,
  LEGACY_TIMESTAMP,
  legacyText,
  legacyVarchar,
  TIMESTAMP_NULLABLE,
} from './columns';
import { Comment } from './comment.entity';
import { Message } from './message.entity';
import { Node } from './node.entity';
import { User } from './user.entity';

/** `file` — legacy dialect. */
@Entity('file')
export class File {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyVarchar())
  name: string;

  @Column({ name: 'orig_name', ...legacyVarchar() })
  origName: string;

  @Column(legacyVarchar())
  path: string;

  @Column({ name: 'full_path', ...legacyVarchar() })
  fullPath: string;

  @Column(legacyVarchar())
  url: string;

  @Column({ type: 'int', nullable: false })
  size: number;

  /** Wider than what the uploader produces; narrowing it rejects existing rows. */
  @Column({
    type: 'enum',
    enum: FILE_TYPE_ENUM_ORDER as unknown as string[],
    nullable: false,
    ...LEGACY_CHARSET,
  })
  type: FileType;

  @Column(legacyVarchar())
  mime: string;

  @Column({
    ...legacyText({ nullable: true }),
    transformer: jsonTransformer<FileMetadata>({}),
  })
  metadata: FileMetadata | null;

  @Column(legacyVarchar({ nullable: true }))
  target: UploadTarget | null;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Index('idx_file_deleted_at')
  @Column({ name: 'deleted_at', ...TIMESTAMP_NULLABLE })
  deletedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_b2d8e683f020f61115edea206b3',
  })
  user: User | null;

  /**
   * Inverse sides of the three `*_files_file` junctions. Required, not just
   * symmetric: a junction's inverse foreign-key actions come from the inverse
   * relation's options, so without these the `fileId` constraints drift to
   * `ON UPDATE CASCADE`.
   */
  @ManyToMany(() => Node, node => node.files, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  nodes: Node[];

  @ManyToMany(() => Comment, comment => comment.files, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  comments: Comment[];

  @ManyToMany(() => Message, message => message.files, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  messages: Message[];
}
