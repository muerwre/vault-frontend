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
 * `like` — node likes.
 *
 * Despite being conceptually a Node↔User join, the live table has its own
 * auto-increment `id` and **nullable** FK columns, which a TypeORM `@JoinTable`
 * cannot express (those require a composite primary key). So it is a first-class
 * entity and like counts are queried explicitly.
 *
 * `like` is a reserved word in MySQL — always quote it (TypeORM does).
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
 * `comment_user_likes` — the **live** comment-likes join table (308 rows).
 *
 * GORM dialect: `int(10) unsigned`, composite primary key, no foreign keys and
 * no `id`. Modelled as an entity with a composite PK so the baseline migration
 * reproduces it exactly.
 *
 * ⚠️ Do not confuse with `comment_likes` (see CommentLikesOrphan below).
 */
@Entity('comment_user_likes')
export class CommentUserLike {
  @PrimaryColumn({ name: 'commentId', type: 'int', unsigned: true })
  commentId: number;

  @PrimaryColumn({ name: 'userId', type: 'int', unsigned: true })
  userId: number;
}

/**
 * `comment_likes` — **dead table, never read or written.**
 *
 * The Go code declared comment-likes with two different join-table names; this
 * is the losing one. It is empty (0 rows) and its columns are nonsense for the
 * purpose — `user_id` *and* `userId`, with no comment reference at all — which
 * is why it never worked and `comment_user_likes` is the live one.
 *
 * Kept as an entity purely so the baseline migration is a complete description
 * of the production schema. Dropping it is a safe follow-up cleanup, but that is
 * a deliberate schema change and belongs in its own migration, not the baseline.
 */
@Entity('comment_likes')
export class CommentLikesOrphan {
  @PrimaryColumn({ name: 'user_id', type: 'int', unsigned: true })
  userIdSnake: number;

  @PrimaryColumn({ name: 'userId', type: 'int', unsigned: true })
  userId: number;
}
