import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import {
  jsonTransformer,
  LEGACY_TIMESTAMP,
  legacyText,
  legacyVarchar,
} from './columns';
import { Node } from './node.entity';
import { User } from './user.entity';

/** Legacy dialect. The wire DTO exposes the primary key as uppercase `ID`. */
@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column(legacyVarchar())
  title: string;

  @Column({
    ...legacyText({ nullable: true }),
    transformer: jsonTransformer<Record<string, string>>({}),
  })
  data: Record<string, string> | null;

  @Column({ name: 'userId', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'created_at', ...LEGACY_TIMESTAMP })
  createdAt: Date;

  @Column({ name: 'updated_at', ...LEGACY_TIMESTAMP })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FK_d0dc39ff83e384b4a097f47d3f5',
  })
  user: User | null;

  @ManyToMany(() => Node, (node) => node.tags, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  nodes: Node[];
}
