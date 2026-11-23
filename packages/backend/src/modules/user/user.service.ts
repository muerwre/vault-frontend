import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GUEST_USER_ID } from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Node } from '../../entities/node.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import {
  toWireProfile,
  toWireProfileFlow,
  toWireProfileNode,
  type WireProfile,
  type WireProfileNode,
} from '../../wire/serialize';
import { LabService, type WireLabItem } from '../node/lab.service';
import { applyVisibleToViewer } from '../node/node.predicates';

/** Most rows returned per request by the node listing, and the default. */
export const USER_NODES_LIMIT = 100;

/** A lab-card item whose node carries the profile's cell look. */
export interface WireProfileItem extends WireLabItem {
  node: WireLabItem['node'] & { has_profile_flow: boolean };
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    private readonly lab: LabService,
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
   * A user's nodes as flow cells, or with `full`, as lab-card items: full
   * nodes with their comment counts, enough for the profile to draw either
   * view from one listing. Both carry the profile's own cell look in `flow`.
   * See `findUserNodes` for which nodes and in what order.
   */
  async getUserNodes(
    userId: number,
    uid: number,
    after: Date | null,
    limit?: number,
    full = false,
  ): Promise<WireProfileNode[] | WireProfileItem[]> {
    const rows = await this.findUserNodes(
      userId,
      uid !== GUEST_USER_ID,
      after,
      limit,
    );

    if (!full) {
      return rows.map(toWireProfileNode);
    }

    const items = await this.lab.toItems(rows, uid);

    return items.map((item, index) => ({
      ...item,
      node: {
        ...item.node,
        flow: toWireProfileFlow(rows[index]),
        has_profile_flow: !!rows[index].settings?.profile_flow,
      },
    }));
  }

  /**
   * A user's nodes: the ones the author pinned, newest first, then the rest,
   * newest first, wherever each is listed. `after` is a `created_at` cursor
   * over the unpinned ones; pinned nodes come only with the first page and do
   * not count against its `limit`. Guests see no lab nodes. A `limit` that is
   * not a whole number within `1..USER_NODES_LIMIT` falls back to the maximum.
   */
  private async findUserNodes(
    userId: number,
    isUser: boolean,
    after: Date | null,
    limit?: number,
  ): Promise<Node[]> {
    const take =
      limit && Number.isInteger(limit) && limit > 0 && limit <= USER_NODES_LIMIT
        ? limit
        : USER_NODES_LIMIT;

    const base = () =>
      applyVisibleToViewer(
        this.nodes
          .createQueryBuilder('node')
          .leftJoinAndSelect('node.user', 'user')
          .leftJoinAndSelect('user.photo', 'userPhoto')
          .where('node.userId = :userId', { userId }),
        'node',
        isUser,
      ).orderBy('node.created_at', 'DESC');

    const rest = base().andWhere('node.is_pinned = 0');

    if (after) {
      rest.andWhere('node.created_at < :after', { after });
    }

    const [pinned, rows] = await Promise.all([
      after
        ? Promise.resolve([])
        : base()
            .andWhere('node.is_pinned = 1')
            .limit(USER_NODES_LIMIT)
            .getMany(),
      rest.limit(take).getMany(),
    ]);

    return [...pinned, ...rows];
  }
}
