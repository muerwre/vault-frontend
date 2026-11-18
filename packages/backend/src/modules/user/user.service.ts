import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import {
  toWireProfile,
  toWireShallowNode,
  type WireProfile,
  type WireShallowNode,
} from '../../wire/serialize';
import { applyVisibleToViewer } from '../node/node.predicates';

/** Most rows returned per request by the node listing, and the default. */
export const USER_NODES_LIMIT = 100;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
  ) {}

  /** Lookup is by exact username. Soft-deleted accounts are not found. */
  async getProfile(username: string): Promise<WireProfile | null> {
    const user = await this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoinAndSelect('user.cover', 'cover')
      .where('user.username = :username', { username })
      .andWhere('user.deleted_at IS NULL')
      .getOne();

    if (!user) {
      return null;
    }

    return toWireProfile(
      user,
      await this.profiles.findOneBy({ userId: user.id }),
    );
  }

  findByUsername(username: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  /**
   * A user's nodes, newest first. `after` is a `created_at` cursor: only older
   * nodes are returned. Guests see flow nodes only. A `limit` that is not a
   * whole number within `1..USER_NODES_LIMIT` falls back to the maximum.
   */
  async getUserNodes(
    userId: number,
    isUser: boolean,
    after: Date | null,
    limit?: number,
  ): Promise<WireShallowNode[]> {
    const query = applyVisibleToViewer(
      this.nodes
        .createQueryBuilder('node')
        .leftJoinAndSelect('node.user', 'user')
        .leftJoinAndSelect('user.photo', 'userPhoto')
        .where('node.userId = :userId', { userId }),
      'node',
      isUser,
    );

    if (after) {
      query.andWhere('node.created_at < :after', { after });
    }

    const rows = await query
      .orderBy('node.created_at', 'DESC')
      .limit(
        limit &&
          Number.isInteger(limit) &&
          limit > 0 &&
          limit <= USER_NODES_LIMIT
          ? limit
          : USER_NODES_LIMIT,
      )
      .getMany();

    return rows.map(toWireShallowNode);
  }
}
