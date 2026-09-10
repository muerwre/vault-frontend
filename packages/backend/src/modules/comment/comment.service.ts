import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GUEST_USER_ID } from '@vault/common/constants';
import { MAX_COMMENT_LENGTH, ROLES } from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { CommentUserLike } from '../../entities/like.entity';
import { Node } from '../../entities/node.entity';
import type { User } from '../../entities/user.entity';
import {
  sortFilesByOrder,
  toWireDate,
  toWireFile,
  toWireString,
  toWireUser,
  type WireFile,
  type WireUser,
} from '../../wire/serialize';

/**
 * A comment as listed under a node.
 *
 * `node` is always null here — the listing does not load it, and clients read
 * the node from the surrounding request.
 */
export interface WireComment {
  id: number;
  created_at: string;
  updated_at: string;
  text: string;
  like_count: number;
  liked: boolean;
  user: WireUser | null;
  node: null;
  files: WireFile[];
}

export interface WireCommentsResponse {
  comments: WireComment[];
  comment_count: number;
}

export const COMMENTS_DEFAULT_TAKE = 100;

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly comments: Repository<Comment>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(CommentUserLike)
    private readonly commentLikes: Repository<CommentUserLike>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
  ) {}

  /**
   * Comments on a node. `comment_count` is the total for the node, not the size
   * of this page. Soft-deleted comments are excluded from both.
   *
   * `liked` is only ever true for an authenticated caller.
   */
  async getComments(
    nodeId: number,
    take: number,
    skip: number,
    order: 'ASC' | 'DESC',
    uid: number,
  ): Promise<WireCommentsResponse> {
    const build = () =>
      this.comments
        .createQueryBuilder('comment')
        .where('comment.nodeId = :nodeId', { nodeId })
        .andWhere('comment.deleted_at IS NULL');

    const commentCount = await build().getCount();

    const rows = await build()
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto')
      .leftJoinAndSelect('user.cover', 'userCover')
      .orderBy('comment.created_at', order)
      .skip(skip)
      .take(take)
      .getMany();

    if (rows.length === 0) {
      return { comments: [], comment_count: commentCount };
    }

    const [filesById, likes] = await Promise.all([
      this.loadFiles(rows),
      this.loadLikes(rows.map((row) => row.id)),
    ]);

    return {
      comment_count: commentCount,
      comments: rows.map((comment) => {
        const order = comment.filesOrder ?? [];
        const files = sortFilesByOrder(
          order.map((id) => filesById.get(id)).filter((f): f is File => !!f),
          order,
        );
        const likedBy = likes.get(comment.id) ?? new Set<number>();

        return {
          id: comment.id,
          created_at: toWireDate(comment.createdAt),
          updated_at: toWireDate(comment.updatedAt),
          text: toWireString(comment.text),
          like_count: likedBy.size,
          liked: uid !== GUEST_USER_ID && likedBy.has(uid),
          user: toWireUser(comment.user),
          node: null as null,
          files: files.map(toWireFile),
        };
      }),
    };
  }

  /** One query for every page's files, keyed by id. */
  private async loadFiles(comments: Comment[]): Promise<Map<number, File>> {
    const ids = [...new Set(comments.flatMap((c) => c.filesOrder ?? []))];

    if (ids.length === 0) {
      return new Map();
    }

    const files = await this.files
      .createQueryBuilder('file')
      .where('file.id IN (:...ids)', { ids })
      .getMany();

    return new Map(files.map((file) => [file.id, file]));
  }

  /** One query for the whole page's likes, giving both count and membership. */
  private async loadLikes(
    commentIds: number[],
  ): Promise<Map<number, Set<number>>> {
    const rows = await this.commentLikes
      .createQueryBuilder('cl')
      .where('cl.commentId IN (:...ids)', { ids: commentIds })
      .getMany();

    const byComment = new Map<number, Set<number>>();

    for (const row of rows) {
      const set = byComment.get(row.commentId) ?? new Set<number>();
      set.add(row.userId);
      byComment.set(row.commentId, set);
    }

    return byComment;
  }

  // ---------------------------------------------------------------- writes

  /** Minimum length at which a comment can become the node's description. */
  private static readonly BRIEF_MIN_LENGTH = 64;

  findById(id: number, includeDeleted = false): Promise<Comment | null> {
    const query = this.comments
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.photo', 'userPhoto')
      .where('comment.id = :id', { id });

    if (!includeDeleted) {
      query.andWhere('comment.deleted_at IS NULL');
    }

    return query.getOne();
  }

  /** The author or an admin. */
  canEdit(comment: Comment, actor: Pick<User, 'id' | 'role'>): boolean {
    return actor.role === ROLES.ADMIN || comment.userId === actor.id;
  }

  /**
   * Validates a comment body. A comment needs text or at least one file; text
   * alone is capped at {@link MAX_COMMENT_LENGTH}.
   */
  validate(text: string, fileIds: number[]): string | null {
    if (text.length > MAX_COMMENT_LENGTH) {
      return 'Комментарий слишком длинный';
    }

    if (text.length < 1 && fileIds.length === 0) {
      return 'Комментарий должен содержать текст или файл';
    }

    return null;
  }

  /** Keeps only ids that exist, in the order supplied. */
  async resolveFileIds(ids: number[]): Promise<number[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.files
      .createQueryBuilder('file')
      .select('file.id', 'id')
      .where('file.id IN (:...ids)', { ids })
      .getRawMany();

    const known = new Set(rows.map((row: { id: number }) => Number(row.id)));

    return ids.filter((id) => known.has(id));
  }

  async create(
    nodeId: number,
    userId: number,
    text: string,
    fileIds: number[],
  ): Promise<Comment> {
    const saved = await this.comments.save(
      this.comments.create({ nodeId, userId, text, filesOrder: fileIds }),
    );

    await this.setFiles(saved.id, fileIds);

    return saved;
  }

  async update(
    comment: Comment,
    text: string,
    fileIds: number[],
  ): Promise<Comment> {
    await this.comments.update(comment.id, { text, filesOrder: fileIds });
    await this.setFiles(comment.id, fileIds);

    comment.text = text;
    comment.filesOrder = fileIds;

    return comment;
  }

  /** Rewrites the whole junction so stored rows match `files_order`. */
  private async setFiles(commentId: number, fileIds: number[]): Promise<void> {
    await this.comments.manager.transaction(async (manager) => {
      await manager.query(
        'DELETE FROM comment_files_file WHERE commentId = ?',
        [commentId],
      );

      if (fileIds.length > 0) {
        await manager.query(
          `INSERT INTO comment_files_file (commentId, fileId) VALUES ${fileIds
            .map(() => '(?, ?)')
            .join(', ')}`,
          fileIds.flatMap((id) => [commentId, id]),
        );
      }
    });
  }

  /**
   * Sets or clears this user's like. The join table has no unique constraint, so
   * an existing row is removed explicitly rather than relying on the database.
   */
  async setLike(
    commentId: number,
    userId: number,
    liked: boolean,
  ): Promise<void> {
    await this.commentLikes.delete({ commentId, userId });

    if (liked) {
      await this.commentLikes.save(
        this.commentLikes.create({ commentId, userId }),
      );
    }
  }

  async setDeleted(comment: Comment, isLocked: boolean): Promise<Date | null> {
    if (!isLocked) {
      await this.comments.update(comment.id, { deletedAt: null });
      return null;
    }

    const deletedAt = new Date();
    deletedAt.setMilliseconds(0);
    await this.comments.update(comment.id, { deletedAt });

    return deletedAt;
  }

  /**
   * Re-points `node.commented_at` at the newest surviving comment, or clears it
   * when none remain. Called after any comment write so the "updated" feed and
   * the recent list stay accurate.
   */
  async syncNodeCommentedAt(nodeId: number): Promise<void> {
    const latest = await this.comments
      .createQueryBuilder('comment')
      .where('comment.nodeId = :nodeId AND comment.deleted_at IS NULL', {
        nodeId,
      })
      .orderBy('comment.created_at', 'DESC')
      .getOne();

    await this.nodes.update(nodeId, { commentedAt: latest?.createdAt ?? null });
  }

  /**
   * Promotes a long comment to the node's description when the node has none and
   * the comment is by its author.
   */
  async maybeSetNodeDescription(node: Node, comment: Comment): Promise<void> {
    if (
      !node.description &&
      node.userId !== null &&
      comment.userId === node.userId &&
      comment.text.length >= CommentService.BRIEF_MIN_LENGTH
    ) {
      await this.nodes.update(node.id, { description: comment.text });
    }
  }

  /** Serialises one comment for a write response. */
  async toWire(commentId: number, uid: number): Promise<WireComment> {
    const comment = await this.findById(commentId, true);

    if (!comment) {
      throw new Error(`comment ${commentId} disappeared after a write`);
    }

    const order = comment.filesOrder ?? [];
    const filesById = await this.loadFiles([comment]);
    const files = sortFilesByOrder(
      order.map((id) => filesById.get(id)).filter((f): f is File => !!f),
      order,
    );
    const likes = await this.loadLikes([comment.id]);
    const likedBy = likes.get(comment.id) ?? new Set<number>();

    return {
      id: comment.id,
      created_at: toWireDate(comment.createdAt),
      updated_at: toWireDate(comment.updatedAt),
      text: toWireString(comment.text),
      like_count: likedBy.size,
      liked: uid !== GUEST_USER_ID && likedBy.has(uid),
      user: toWireUser(comment.user),
      node: null as null,
      files: files.map(toWireFile),
    };
  }
}
