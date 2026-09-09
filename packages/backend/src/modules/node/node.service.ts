import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  GUEST_USER_ID,
  NODE_BACKLINK_PROVIDERS,
  NODE_TYPES,
  ROLES,
} from '@vault/common/constants';
import type { INodeFlow } from '@vault/common/types';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Like } from '../../entities/like.entity';
import { NodeSocialPublication } from '../../entities/node-extras.entity';
import { Node } from '../../entities/node.entity';
import { NodeView } from '../../entities/views.entity';
import {
  sortFilesByOrder,
  toWireDate,
  toWireFlow,
  toWireNode,
  toWireShallowNode,
  type WireNode,
  type WireShallowNode,
} from '../../wire/serialize';

import {
  applyIsFlowNode,
  applyIsFlowOrLabNode,
} from './node.predicates';
import {
  type Actor,
  canEditNode,
  canHeroNode,
  canLikeNode,
} from './node.permissions';

/**
 * `GET /nodes/` response. Every slice is always present and never null; a
 * disabled `with_*` flag yields an empty array.
 */
export interface WireFlowDiff {
  before: WireShallowNode[];
  after: WireShallowNode[];
  heroes: WireShallowNode[];
  updated: WireShallowNode[];
  recent: WireShallowNode[];
  /** Ids still visible in the requested window; drives client cache eviction. */
  valid: number[];
}

export interface FlowDiffParams {
  start: Date;
  end: Date;
  take: number;
  withHeroes: boolean;
  withUpdated: boolean;
  withRecent: boolean;
  withValid: boolean;
  uid: number;
}

/** Fixed limits per slice. */
const LIMITS = {
  before: 100,
  heroes: 20,
  updated: 10,
  recent: 16,
} as const;

export const FLOW_DEFAULT_TAKE = 40;

/** `end` defaults to 30 days before `start`. */
export const FLOW_DEFAULT_WINDOW_DAYS = 30;

/** Projection used by `GET /nodes/:id/related`. */
export interface WireRelatedItem {
  id: number;
  thumbnail: string;
  title: string;
  is_promoted: boolean;
}

export interface WireRelated {
  related: {
    /** Keyed by album tag title. */
    albums: Record<string, WireRelatedItem[]>;
    similar: WireRelatedItem[];
  };
}

/** Tags beginning with this are album tags; the rest drive `similar`. */
const ALBUM_TAG_PREFIX = '/';

/** Both slices are capped at this many rows. */
const RELATED_LIMIT = 6;

/** `GET /nodes/:id` response. `last_seen` is omitted entirely for guests. */
export interface WireGetNode {
  node: WireNode;
  backlinks: Array<{ provider: string; link: string }>;
  last_seen?: string;
}

@Injectable()
export class NodeService {
  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(Like) private readonly likes: Repository<Like>,
    @InjectRepository(NodeView) private readonly nodeViews: Repository<NodeView>,
    @InjectRepository(NodeSocialPublication)
    private readonly backlinks: Repository<NodeSocialPublication>,
  ) {}

  /**
   * A single node with its files, tags, cover, author and like state.
   *
   * Soft-deleted nodes stay visible to their author and to admins; everyone else
   * gets null so the caller can 404.
   *
   * `last_seen` is the view timestamp from *before* this request, then the view
   * is bumped — so a client can tell which comments are new.
   */
  async getNode(
    id: number,
    uid: number,
    role: string,
  ): Promise<WireGetNode | null> {
    const query = this.nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto')
      .leftJoinAndSelect('user.cover', 'userCover')
      .leftJoinAndSelect('node.cover', 'cover')
      .leftJoinAndSelect('node.tags', 'tags')
      .where('node.id = :id', { id });

    if (!(uid !== GUEST_USER_ID && role === ROLES.ADMIN)) {
      query.andWhere('(node.deleted_at IS NULL OR node.userId = :uid)', { uid });
    }

    const node = await query.getOne();

    if (!node) {
      return null;
    }

    const [files, likeCount, isLiked, links, lastSeen] = await Promise.all([
      this.getOrderedFiles(node),
      this.countLikes(node.id),
      uid === GUEST_USER_ID ? false : this.isLikedBy(node.id, uid),
      this.getBacklinks(node.id),
      uid === GUEST_USER_ID ? null : this.touchNodeView(uid, node.id),
    ]);

    return {
      node: toWireNode(node, files, { isLiked, likeCount }),
      backlinks: links,
      ...(lastSeen === null ? {} : { last_seen: lastSeen }),
    };
  }

  /**
   * Related nodes, split by tag kind: album tags (prefixed `/`) group into
   * `albums` by tag title, all other tags feed `similar` ranked by how many tags
   * are shared.
   *
   * Both sides are restricted to the same `type` and `is_promoted` as the source
   * node, and exclude it. A node with no tags yields empty results.
   */
  async getRelated(id: number): Promise<WireRelated> {
    const empty: WireRelated = { related: { albums: {}, similar: [] } };

    const node = await this.nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.tags', 'tags')
      .where('node.id = :id', { id })
      .getOne();

    if (!node || (node.tags ?? []).length === 0) {
      return empty;
    }

    const albumIds: number[] = [];
    const similarIds: number[] = [];

    for (const tag of node.tags) {
      if ((tag.title ?? '').startsWith(ALBUM_TAG_PREFIX)) {
        albumIds.push(tag.id);
      } else {
        similarIds.push(tag.id);
      }
    }

    const [albums, similar] = await Promise.all([
      this.getAlbumRelated(albumIds, node),
      this.getSimilarRelated(similarIds, node),
    ]);

    return { related: { albums, similar } };
  }

  private async getAlbumRelated(
    tagIds: number[],
    node: Node,
  ): Promise<Record<string, WireRelatedItem[]>> {
    const albums: Record<string, WireRelatedItem[]> = {};

    if (tagIds.length === 0) {
      return albums;
    }

    const rows: Array<{
      album: string | null;
      id: number;
      thumbnail: string | null;
      title: string | null;
      is_promoted: number;
    }> = await this.nodes.query(
      `SELECT \`tag\`.\`title\` AS album, \`node\`.\`id\` AS id,
              \`node\`.\`thumbnail\` AS thumbnail, \`node\`.\`title\` AS title,
              \`node\`.\`is_promoted\` AS is_promoted
         FROM \`node_tags_tag\` \`tags\`
         LEFT JOIN \`tag\` ON \`tags\`.\`tagId\` = \`tag\`.\`id\`
         LEFT JOIN \`node\` ON \`tags\`.\`nodeId\` = \`node\`.\`id\`
        WHERE \`tags\`.\`tagId\` IN (?)
          AND \`node\`.\`type\` = ?
          AND \`node\`.\`id\` NOT IN (?)
          AND \`node\`.\`deleted_at\` IS NULL
          AND \`node\`.\`is_promoted\` = ?
        LIMIT ?`,
      [tagIds, node.type, [node.id], node.isPromoted ? 1 : 0, RELATED_LIMIT],
    );

    for (const row of rows) {
      const key = row.album ?? '';
      albums[key] = albums[key] ?? [];
      albums[key].push({
        id: Number(row.id),
        thumbnail: row.thumbnail ?? '',
        title: row.title ?? '',
        is_promoted: Boolean(row.is_promoted),
      });
    }

    return albums;
  }

  /** Ranked by number of shared tags, descending. */
  private async getSimilarRelated(
    tagIds: number[],
    node: Node,
  ): Promise<WireRelatedItem[]> {
    if (tagIds.length === 0) {
      return [];
    }

    const rows: Array<{
      id: number;
      thumbnail: string | null;
      title: string | null;
      is_promoted: number;
    }> = await this.nodes.query(
      `SELECT \`node\`.\`id\` AS id, \`node\`.\`thumbnail\` AS thumbnail,
              \`node\`.\`title\` AS title, \`node\`.\`is_promoted\` AS is_promoted,
              COUNT(\`t1\`.\`nodeId\`) AS \`count\`
         FROM \`node\`
         JOIN (
           SELECT * FROM \`node_tags_tag\` \`tags\`
            WHERE \`tags\`.\`tagId\` IN (?) AND \`nodeId\` NOT IN (?)
         ) AS \`t1\` ON \`t1\`.\`nodeId\` = \`node\`.\`id\`
        WHERE \`node\`.\`type\` = ?
          AND \`node\`.\`is_promoted\` = ?
          AND \`node\`.\`deleted_at\` IS NULL
        GROUP BY \`t1\`.\`nodeId\`
        ORDER BY \`count\` DESC
        LIMIT ?`,
      [tagIds, [node.id], node.type, node.isPromoted ? 1 : 0, RELATED_LIMIT],
    );

    return rows.map(row => ({
      id: Number(row.id),
      thumbnail: row.thumbnail ?? '',
      title: row.title ?? '',
      is_promoted: Boolean(row.is_promoted),
    }));
  }

  /** Files come from `files_order`, not the join table, and keep that order. */
  private async getOrderedFiles(node: Node): Promise<File[]> {
    const order = node.filesOrder ?? [];

    if (order.length === 0) {
      return [];
    }

    const files = await this.files
      .createQueryBuilder('file')
      .where('file.id IN (:...ids)', { ids: order })
      .getMany();

    return sortFilesByOrder(files, order);
  }

  private countLikes(nodeId: number): Promise<number> {
    return this.likes.createQueryBuilder('l').where('l.nodeId = :nodeId', { nodeId }).getCount();
  }

  private async isLikedBy(nodeId: number, uid: number): Promise<boolean> {
    const count = await this.likes
      .createQueryBuilder('l')
      .where('l.nodeId = :nodeId AND l.userId = :uid', { nodeId, uid })
      .getCount();

    return count > 0;
  }

  private async getBacklinks(
    nodeId: number,
  ): Promise<Array<{ provider: string; link: string }>> {
    const rows = await this.backlinks
      .createQueryBuilder('pub')
      .where('pub.node_id = :nodeId', { nodeId })
      .andWhere('pub.provider IN (:...providers)', {
        providers: [...NODE_BACKLINK_PROVIDERS],
      })
      .getMany();

    return rows.map(row => ({
      provider: row.provider ?? '',
      link: row.link ?? '',
    }));
  }

  /**
   * Returns the previous visit timestamp and records the current one. There is a
   * unique index on `(nodeId, userId)`, so the insert is an upsert.
   */
  private async touchNodeView(uid: number, nodeId: number): Promise<string | null> {
    const existing = await this.nodeViews
      .createQueryBuilder('nv')
      .where('nv.userId = :uid AND nv.nodeId = :nodeId', { uid, nodeId })
      .getOne();

    const visited = new Date();

    if (existing) {
      await this.nodeViews.update(existing.id, { visited });
    } else {
      await this.nodeViews
        .createQueryBuilder()
        .insert()
        .values({ userId: uid, nodeId, visited })
        .orUpdate(['visited'], ['nodeId', 'userId'])
        .execute();
    }

    return toWireDate(existing ? existing.visited : visited);
  }

  async getFlowDiff(params: FlowDiffParams): Promise<WireFlowDiff> {
    const [before, after, heroes, updated] = await Promise.all([
      this.getBefore(params.start),
      this.getAfter(params.end, params.take),
      params.withHeroes ? this.getHeroes() : [],
      params.withUpdated ? this.getUpdated(params.uid) : [],
    ]);

    // `recent` excludes whatever `updated` already returned, so it must wait.
    const [recent, valid] = await Promise.all([
      params.withRecent
        ? this.getRecent(
            updated.map(node => node.id),
            params.uid !== GUEST_USER_ID,
          )
        : [],
      params.withValid ? this.getValidIds(params.start, params.end) : [],
    ]);

    return {
      before: before.map(toWireShallowNode),
      after: after.map(toWireShallowNode),
      heroes: heroes.map(toWireShallowNode),
      updated: updated.map(toWireShallowNode),
      recent: recent.map(toWireShallowNode),
      valid,
    };
  }

  /** Newer than the window: what the client has not seen yet. */
  private getBefore(start: Date): Promise<Node[]> {
    return this.flowQuery()
      .andWhere('node.created_at > :start', { start })
      .orderBy('node.created_at', 'DESC')
      .limit(LIMITS.before)
      .getMany();
  }

  /** Older than the window: the next page. */
  private getAfter(end: Date, take: number): Promise<Node[]> {
    return this.flowQuery()
      .andWhere('node.created_at < :end', { end })
      .orderBy('node.created_at', 'DESC')
      .limit(take)
      .getMany();
  }

  /** Randomised set for the top carousel. Images only. */
  private getHeroes(): Promise<Node[]> {
    return this.flowQuery()
      .andWhere('node.type = :type', { type: NODE_TYPES.IMAGE })
      .andWhere('node.is_heroic = 1')
      .orderBy('RAND()')
      .limit(LIMITS.heroes)
      .getMany();
  }

  /**
   * Nodes commented on since this user last opened them.
   *
   * A guest has no `node_view` rows, so `visited` is NULL and the comparison
   * yields no rows — guests always get an empty slice.
   */
  private getUpdated(uid: number): Promise<Node[]> {
    return this.flowQuery()
      .leftJoin(
        'node_view',
        'node_view',
        'node_view.nodeId = node.id AND node_view.userId = :uid',
        { uid },
      )
      .andWhere('node_view.visited < node.commented_at')
      .orderBy('node.created_at', 'DESC')
      .limit(LIMITS.updated)
      .getMany();
  }

  /** Most recently commented nodes, minus anything already in `updated`. */
  private getRecent(exclude: number[], withLab: boolean): Promise<Node[]> {
    const query = withLab
      ? applyIsFlowOrLabNode(this.baseQuery(), 'node')
      : applyIsFlowNode(this.baseQuery(), 'node');

    query.andWhere('node.commented_at IS NOT NULL');

    if (exclude.length > 0) {
      query.andWhere('node.id NOT IN (:...exclude)', { exclude });
    }

    return query
      .orderBy('node.commented_at', 'DESC')
      .addOrderBy('node.created_at', 'DESC')
      .limit(LIMITS.recent)
      .getMany();
  }

  /**
   * Ids still visible inside the window. `end` is the older bound, `start` the
   * newer one.
   */
  private async getValidIds(start: Date, end: Date): Promise<number[]> {
    const rows: Array<{ id: number }> = await applyIsFlowNode(
      this.nodes.createQueryBuilder('node'),
      'node',
    )
      .select('node.id', 'id')
      .andWhere('node.created_at >= :end AND node.created_at <= :start', {
        start,
        end,
      })
      .getRawMany();

    return rows.map(row => Number(row.id)).filter(id => id > 0);
  }

  private baseQuery(): SelectQueryBuilder<Node> {
    return this.nodes
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto');
  }

  private flowQuery(): SelectQueryBuilder<Node> {
    return applyIsFlowNode(this.baseQuery(), 'node');
  }

  // ---------------------------------------------------------------- writes

  /** Loads a node for mutation, ignoring soft deletion so a locked one can be restored. */
  findForEdit(id: number): Promise<Node | null> {
    return this.nodes
      .createQueryBuilder('node')
      .where('node.id = :id', { id })
      .getOne();
  }

  /** Excludes soft-deleted nodes; used where a locked node must stay untouchable. */
  findLive(id: number): Promise<Node | null> {
    return this.nodes
      .createQueryBuilder('node')
      .where('node.id = :id AND node.deleted_at IS NULL', { id })
      .getOne();
  }

  /**
   * Toggles this user's like and returns the new state.
   *
   * The `like` table has no unique constraint, so an existing row is deleted
   * rather than relying on the database to reject a duplicate.
   */
  async toggleLike(node: Node, actor: Actor): Promise<boolean> {
    if (!canLikeNode(node)) {
      return false;
    }

    const existing = await this.likes
      .createQueryBuilder('l')
      .where('l.nodeId = :nodeId AND l.userId = :uid', {
        nodeId: node.id,
        uid: actor.id,
      })
      .getOne();

    if (existing) {
      await this.likes.delete({ nodeId: node.id, userId: actor.id });
      return false;
    }

    await this.likes.save(this.likes.create({ nodeId: node.id, userId: actor.id }));

    return true;
  }

  /** Toggles `is_heroic` and returns the new value. */
  async toggleHeroic(node: Node): Promise<boolean> {
    const next = !node.isHeroic;

    await this.nodes.update(node.id, { isHeroic: next });

    return next;
  }

  /** Persists the flow display settings and returns them as stored. */
  async setFlow(node: Node, flow: INodeFlow): Promise<INodeFlow> {
    await this.nodes.update(node.id, { flow });

    return toWireFlow(flow);
  }

  /**
   * Locks (soft-deletes) or restores a node, returning the resulting
   * `deleted_at`. Truncated to the second because the column has no sub-second
   * precision.
   */
  async setLocked(node: Node, isLocked: boolean): Promise<string | null> {
    if (!isLocked) {
      await this.nodes.update(node.id, { deletedAt: null });
      return null;
    }

    const deletedAt = new Date();
    deletedAt.setMilliseconds(0);

    await this.nodes.update(node.id, { deletedAt });

    return toWireDate(deletedAt);
  }

  /** Bumps `commented_at`, which drives the "updated" feed and notifications. */
  async touchCommentedAt(nodeId: number, at: Date = new Date()): Promise<void> {
    const commentedAt = new Date(at);
    commentedAt.setMilliseconds(0);

    await this.nodes.update(nodeId, { commentedAt });
  }

  /** True when this actor may edit the node. */
  canEdit(node: Node, actor: Actor): boolean {
    return canEditNode(node, actor);
  }

  canHero(node: Node, actor: Actor): boolean {
    return canHeroNode(node, actor);
  }
}
