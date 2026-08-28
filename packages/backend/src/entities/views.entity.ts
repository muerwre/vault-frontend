import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LEGACY_TIMESTAMP } from './columns';
import { Node } from './node.entity';
import { User } from './user.entity';

/**
 * When a user last opened a node. Drives the "updated since your last visit"
 * marker (`visited < node.commented_at`).
 *
 * An entity rather than a join table: it has its own `id` plus a payload column.
 */
@Entity('node_view')
@Index('IDX_b9eef954a619229d26641e5e7d', ['nodeId', 'userId'], { unique: true })
export class NodeView {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'visited', ...LEGACY_TIMESTAMP })
  visited: Date;

  @Column({ name: 'nodeId', type: 'int', nullable: true })
  nodeId: number | null;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => Node, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'nodeId',
    foreignKeyConstraintName: 'FK_1c70e7abe9702b1d40f2bbd9bb0',
  })
  node: Node | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_4f3b0c25129817036a8b070a140',
  })
  user: User | null;
}

/** When `userId` last viewed their dialog with `dialogId`. Both reference `user`. */
@Entity('message_view')
@Index('IDX_81d1e3edf061df94b2668ba798', ['dialogId', 'userId'], {
  unique: true,
})
export class MessageView {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'viewed', ...LEGACY_TIMESTAMP })
  viewed: Date;

  /** The other party in the dialog. */
  @Column({ name: 'dialogId', type: 'int', nullable: true })
  dialogId: number | null;

  /** The viewer. */
  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'dialogId',
    foreignKeyConstraintName: 'FK_f72b3a46e2a6dd4ef146ebdb755',
  })
  dialog: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_abbf1dbfd3ca847b1ade4ab3011',
  })
  user: User | null;
}
