import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GUEST_USER_ID, LAB_SORT, type LabSort } from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { Like } from '../../entities/like.entity';
import { Node } from '../../entities/node.entity';
import { Tag } from '../../entities/tag.entity';
import { NodeView } from '../../entities/views.entity';
import {
  toWireDateOrNull,
  toWireNode,
  toWireShallowNode,
  toWireTag,
  type WireNode,
  type WireShallowNode,
  type WireTag,
} from '../../wire/serialize';

import { applyIsLabNode } from './node.predicates';

export interface WireLabItem {
  node: WireNode;
  comment_count: number;
  last_seen: string | null;
}

export interface WireLabList {
  nodes: WireLabItem[];
  count: number;
}

export interface WireLabStats {
  tags: WireTag[];
  heroes: WireShallowNode[];
  /** Always empty; the field is kept because clients read it. */
  comments: never[];
}

export const LAB_DEFAULT_LIMIT = 20;
export const LAB_MAX_LIMIT = 100;

/**
 * Sort expression shared by every mode: newest activity first, falling back to
 * creation time for nodes that were never commented on.
 */
const ORDER_BY_ACTIVITY = 'IF(node.commented_at = 0, node.created_at, node.commented_at)';

const HEROES_LIMIT = 20;
const POPULAR_TAGS_LIMIT = 24;

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(Like) private readonly likes: Repository<Like>,
    @InjectRepository(Tag) private readonly tags: Repository<Tag>,
    @InjectRepository(NodeView) private readonly nodeViews: Repository<NodeView>,
  ) {}

  /**
   * The lab feed: unpromoted public nodes. Each item carries its comment count
   * and, for the caller, when they last opened it.
   */
  async getList(
    limit: number,
    offset: number,
    sort: LabSort,
    search: string,
    uid: number,
  ): Promise<WireLabList> {
    const build = () => {
      const query = applyIsLabNode(this.nodes.createQueryBuilder('node'), 'node');

      if (search) {
        query.andWhere(
          "(node.title LIKE CONCAT('%', :search, '%') OR node.description LIKE CONCAT('%', :search, '%'))",
          { search },
        );
      }

      return query;
    };

    const count = await build().getCount();

    const query = build()
      .leftJoinAndSelect('node.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto');

    if (sort === LAB_SORT.HOT) {
      /**
       * Ranked by engagement. Both joins are inner, so a node with no comments
       * or no likes drops out of this mode entirely.
       */
      query
        .innerJoin(
          '(SELECT COUNT(comment.id) AS commentCount, comment.nodeId AS nodeId FROM comment GROUP BY comment.nodeId)',
          'c',
          'c.nodeId = node.id',
        )
        .innerJoin(
          '(SELECT COUNT(`like`.id) AS likeCount, `like`.nodeId AS nodeId FROM `like` GROUP BY `like`.nodeId)',
          'l',
          'l.nodeId = node.id',
        )
        .orderBy('(c.commentCount + l.likeCount)', 'DESC')
        .addOrderBy(ORDER_BY_ACTIVITY, 'DESC');
    } else {
      if (sort === LAB_SORT.HEROIC) {
        query.andWhere('node.is_heroic IS TRUE');
      }

      query.orderBy(ORDER_BY_ACTIVITY, 'DESC');
    }

    const rows = await query.limit(limit).offset(offset).getMany();
    const ids = rows.map(node => node.id);

    const [commentCounts, lastSeens, likeCounts, likedByMe] = await Promise.all([
      this.countComments(ids),
      this.getLastSeens(uid, ids),
      this.countLikes(ids),
      this.getLikedByUser(uid, ids),
    ]);

    return {
      count,
      nodes: rows.map(node => ({
        node: toWireNode(node, [], {
          likeCount: likeCounts.get(node.id) ?? 0,
          isLiked: likedByMe.has(node.id),
        }),
        comment_count: commentCounts.get(node.id) ?? 0,
        last_seen: toWireDateOrNull(lastSeens.get(node.id) ?? null),
      })),
    };
  }

  /** Lab nodes commented on since the caller last opened them. */
  async getUpdates(uid: number): Promise<{ nodes: WireShallowNode[] }> {
    if (uid === GUEST_USER_ID) {
      return { nodes: [] };
    }

    const rows = await applyIsLabNode(
      this.nodes
        .createQueryBuilder('node')
        .leftJoinAndSelect('node.user', 'user')
        .leftJoinAndSelect('user.photo', 'userPhoto'),
      'node',
    )
      .leftJoin(
        'node_view',
        'node_view',
        'node_view.nodeId = node.id AND node_view.userId = :uid',
        { uid },
      )
      .andWhere('node_view.visited < node.commented_at')
      .orderBy('node.created_at', 'DESC')
      .limit(10)
      .getMany();

    return { nodes: rows.map(toWireShallowNode) };
  }

  /** Sidebar data. `comments` is always empty. */
  async getStats(): Promise<WireLabStats> {
    const [tags, heroes] = await Promise.all([
      this.getPopularTags(),
      this.getHeroes(),
    ]);

    return { tags: tags.map(toWireTag), heroes: heroes.map(toWireShallowNode), comments: [] };
  }

  private async getPopularTags(): Promise<Tag[]> {
    return this.tags.query(
      `SELECT t.* FROM node_tags_tag
         LEFT JOIN node ON node_tags_tag.nodeId = node.id
         LEFT JOIN tag t ON node_tags_tag.tagId = t.id
        WHERE node.is_promoted = 0 AND node.deleted_at IS NULL
        GROUP BY node_tags_tag.tagId
        ORDER BY COUNT(node_tags_tag.tagId) DESC
        LIMIT ?`,
      [POPULAR_TAGS_LIMIT],
    );
  }

  private getHeroes(): Promise<Node[]> {
    return applyIsLabNode(
      this.nodes
        .createQueryBuilder('node')
        .leftJoinAndSelect('node.user', 'user')
        .leftJoinAndSelect('user.photo', 'userPhoto'),
      'node',
    )
      .andWhere('node.is_heroic = 1')
      .orderBy('node.commented_at', 'DESC')
      .addOrderBy('node.created_at', 'DESC')
      .limit(HEROES_LIMIT)
      .getMany();
  }

  private async countComments(ids: number[]): Promise<Map<number, number>> {
    if (ids.length === 0) {
      return new Map();
    }

    const rows: Array<{ nodeId: number; count: string }> = await this.comments
      .createQueryBuilder('comment')
      .select('comment.nodeId', 'nodeId')
      .addSelect('COUNT(comment.id)', 'count')
      .where('comment.nodeId IN (:...ids) AND comment.deleted_at IS NULL', { ids })
      .groupBy('comment.nodeId')
      .getRawMany();

    return new Map(rows.map(row => [Number(row.nodeId), Number(row.count)]));
  }

  private async countLikes(ids: number[]): Promise<Map<number, number>> {
    if (ids.length === 0) {
      return new Map();
    }

    const rows: Array<{ nodeId: number; count: string }> = await this.likes
      .createQueryBuilder('l')
      .select('l.nodeId', 'nodeId')
      .addSelect('COUNT(l.id)', 'count')
      .where('l.nodeId IN (:...ids)', { ids })
      .groupBy('l.nodeId')
      .getRawMany();

    return new Map(rows.map(row => [Number(row.nodeId), Number(row.count)]));
  }

  private async getLikedByUser(uid: number, ids: number[]): Promise<Set<number>> {
    if (uid === GUEST_USER_ID || ids.length === 0) {
      return new Set();
    }

    const rows = await this.likes
      .createQueryBuilder('l')
      .where('l.userId = :uid AND l.nodeId IN (:...ids)', { uid, ids })
      .getMany();

    return new Set(rows.map(row => Number(row.nodeId)));
  }

  /** A zero visit timestamp is treated as "never seen". */
  private async getLastSeens(
    uid: number,
    ids: number[],
  ): Promise<Map<number, Date>> {
    if (uid === GUEST_USER_ID || ids.length === 0) {
      return new Map();
    }

    const rows = await this.nodeViews
      .createQueryBuilder('nv')
      .where('nv.userId = :uid AND nv.nodeId IN (:...ids)', { uid, ids })
      .getMany();

    const result = new Map<number, Date>();

    for (const row of rows) {
      if (row.visited && row.nodeId !== null) {
        result.set(row.nodeId, row.visited);
      }
    }

    return result;
  }
}

/** Clamps paging and falls back to the default sort on anything unrecognised. */
export const normaliseLabQuery = (raw: {
  limit?: string;
  offset?: string;
  sort?: string;
  search?: string;
}): { limit: number; offset: number; sort: LabSort; search: string } => {
  const limit = Number.parseInt(raw.limit ?? '', 10);
  const offset = Number.parseInt(raw.offset ?? '', 10);
  const sorts: readonly string[] = Object.values(LAB_SORT);

  return {
    limit:
      Number.isFinite(limit) && limit > 0 && limit <= LAB_MAX_LIMIT
        ? limit
        : LAB_DEFAULT_LIMIT,
    offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
    sort: (sorts.includes(raw.sort ?? '') ? raw.sort : LAB_SORT.NEW) as LabSort,
    search: (raw.search ?? '').trim(),
  };
};
