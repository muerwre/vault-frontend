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
import { Node } from './node.entity';
import { User } from './user.entity';

/** `comment` — legacy dialect, FULLTEXT index on `text`. */
@Entity('comment')
@Index('IDX_84eaa1e0d08e574fb78fd3c9b3', ['text'], { fulltext: true })
export class Comment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  /** Max length enforced in the app layer (`MAX_COMMENT_LENGTH = 8192`). */
  @Column(legacyText({ nullable: false }))
  text: string;

  @Column({
    name: 'files_order',
    ...legacyText({ nullable: false }),
    transformer: filesOrderTransformer,
  })
  filesOrder: number[];

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'nodeId', type: 'int', nullable: true })
  nodeId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Index('idx_comment_deleted_at')
  @Column({ name: 'deleted_at', ...LEGACY_DATETIME_NULLABLE })
  deletedAt: Date | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_c0354a9a009d3bb45a08655ce3b',
  })
  user: User | null;

  @ManyToOne(() => Node, node => node.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'nodeId',
    foreignKeyConstraintName: 'FK_820b0cced48de62eeb991c6e794',
  })
  node: Node | null;

  @ManyToMany(() => File, file => file.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'comment_files_file',
    joinColumn: {
      name: 'commentId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_3e8c49a01afb50951d6cd0e0b00',
    },
    inverseJoinColumn: {
      name: 'fileId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_ea6a49b254c2a9f60fae7ae641b',
    },
  })
  files: File[];

  /** Computed per request from `comment_user_likes`. */
  likeCount?: number;
  liked?: boolean;
}
