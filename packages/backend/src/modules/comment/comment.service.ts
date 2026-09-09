import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GUEST_USER_ID } from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Comment } from '../../entities/comment.entity';
import { File } from '../../entities/file.entity';
import { CommentUserLike } from '../../entities/like.entity';
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
      this.loadLikes(rows.map(row => row.id)),
    ]);

    return {
      comment_count: commentCount,
      comments: rows.map(comment => {
        const order = comment.filesOrder ?? [];
        const files = sortFilesByOrder(
          order.map(id => filesById.get(id)).filter((f): f is File => !!f),
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
    const ids = [...new Set(comments.flatMap(c => c.filesOrder ?? []))];

    if (ids.length === 0) {
      return new Map();
    }

    const files = await this.files
      .createQueryBuilder('file')
      .where('file.id IN (:...ids)', { ids })
      .getMany();

    return new Map(files.map(file => [file.id, file]));
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
}
