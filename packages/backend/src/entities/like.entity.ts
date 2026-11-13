import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Node } from './node.entity';
import { User } from './user.entity';

/**
 * Node likes.
 *
 * Conceptually a Node↔User join, but the table has its own auto-increment `id`
 * and nullable FKs, which `@JoinTable` cannot express — hence a first-class
 * entity with like counts queried explicitly.
 *
 * `like` is a reserved word; it must always be quoted.
 */
@Entity('like')
export class Like {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'nodeId', type: 'int', nullable: true })
  nodeId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_e8fb739f08d47955a39850fac23',
  })
  user: User | null;

  @ManyToOne(() => Node, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'nodeId',
    foreignKeyConstraintName: 'FK_9ebadab2ba5f1e8f092fb119a45',
  })
  node: Node | null;
}

/**
 * Comment likes. Modern dialect: composite primary key, no foreign keys, no `id`.
 *
 * Not to be confused with {@link CommentLikesOrphan}.
 */
@Entity('comment_user_likes')
export class CommentUserLike {
  @PrimaryColumn({ name: 'commentId', type: 'int', unsigned: true })
  commentId: number;

  @PrimaryColumn({ name: 'userId', type: 'int', unsigned: true })
  userId: number;
}

/**
 * Dead table, never read or written. Superseded by {@link CommentUserLike}.
 *
 * Its columns are `user_id` *and* `userId`, with no comment reference at all,
 * which is why it never functioned. Kept only so the baseline migration fully
 * describes the schema; dropping it belongs in its own migration.
 */
@Entity('comment_likes')
export class CommentLikesOrphan {
  @PrimaryColumn({ name: 'user_id', type: 'int', unsigned: true })
  userIdSnake: number;

  @PrimaryColumn({ name: 'userId', type: 'int', unsigned: true })
  userId: number;
}
