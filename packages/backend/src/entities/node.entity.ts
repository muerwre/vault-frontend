import { NODE_TYPE_ENUM_ORDER, type NodeType } from '@vault/common/constants';
import type { INodeBlock, INodeFlow } from '@vault/common/types';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  filesOrderTransformer,
  jsonTransformer,
  LEGACY_CHARSET,
  LEGACY_DATETIME_NULLABLE,
  LEGACY_TIMESTAMP,
  legacyBool,
  legacyText,
  legacyVarchar,
} from './columns';
import { Comment } from './comment.entity';
import { File } from './file.entity';
import { Tag } from './tag.entity';
import { User } from './user.entity';

/** Legacy dialect. FULLTEXT indexes on `title` and `description` back search. */
@Entity('node')
@Index('IDX_7204c77952e8c70fc6c0d5e26b', ['title'], { fulltext: true })
@Index('IDX_4ca96324484c7a3d16aa993cad', ['description'], { fulltext: true })
export class Node {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyVarchar())
  title: string;

  /** Includes `webm`, which is present in the data. */
  @Column({
    type: 'enum',
    enum: NODE_TYPE_ENUM_ORDER as unknown as string[],
    nullable: false,
    ...LEGACY_CHARSET,
  })
  type: NodeType;

  @Column({
    ...legacyText({ nullable: true }),
    transformer: jsonTransformer<INodeBlock[]>([]),
  })
  blocks: INodeBlock[];

  /** Comma-joined file ids. `NOT NULL`: an empty list stores as `''`. */
  @Column({
    name: 'files_order',
    ...legacyText({ nullable: false }),
    transformer: filesOrderTransformer,
  })
  filesOrder: number[];

  @Column({ name: 'is_public', ...legacyBool(1) })
  isPublic: boolean;

  /** `true` → flow feed, `false` → lab. */
  @Column({ name: 'is_promoted', ...legacyBool(1) })
  isPromoted: boolean;

  @Column({ name: 'is_heroic', ...legacyBool(0) })
  isHeroic: boolean;

  /** May carry a `REMOTE_CURRENT:` prefix pointing at the legacy media host. */
  @Column(legacyVarchar({ nullable: true }))
  thumbnail: string | null;

  @Column(legacyText({ nullable: true }))
  description: string | null;

  @Column({
    ...legacyText({ nullable: true }),
    transformer: jsonTransformer<INodeFlow>(null),
  })
  flow: INodeFlow | null;

  @Column({ name: 'commented_at', ...LEGACY_DATETIME_NULLABLE })
  commentedAt: Date | null;

  @Column({ name: 'coverId', type: 'int', nullable: true })
  coverId: number | null;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @Index('idx_node_deleted_at')
  @Column({ name: 'deleted_at', ...LEGACY_DATETIME_NULLABLE })
  deletedAt: Date | null;

  /**
   * One-to-one: `coverId` carries a unique constraint. `ON DELETE NO ACTION`
   * means deleting a file still used as a cover fails rather than nulling it.
   */
  @OneToOne(() => File, { nullable: true, onDelete: 'NO ACTION' })
  @JoinColumn({
    name: 'coverId',
    foreignKeyConstraintName: 'FK_eb77c38da6d87500c1e84ffbcf7',
  })
  cover: File | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_49e3f89e68914252136980d77ac',
  })
  user: User | null;

  @ManyToMany(() => File, (file) => file.nodes, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'node_files_file',
    joinColumn: {
      name: 'nodeId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_8ffb7320092a62cfa9a37305ff2',
    },
    inverseJoinColumn: {
      name: 'fileId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_021adde0193f016a96f9add5196',
    },
  })
  files: File[];

  @ManyToMany(() => Tag, (tag) => tag.nodes, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'node_tags_tag',
    joinColumn: {
      name: 'nodeId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_f93fb13785a5615177ff54eb34b',
    },
    inverseJoinColumn: {
      name: 'tagId',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_2050877825e4558d76d4b21b7d1',
    },
  })
  tags: Tag[];

  @OneToMany(() => Comment, (comment) => comment.node)
  comments: Comment[];

  /** Computed per request, never persisted. */
  isLiked?: boolean;
  likeCount?: number;
}
