import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';

import { User } from '../../entities/user.entity';
import { VaultException } from '../../globals/exceptions';
import { toWireDate } from '../../wire/serialize';
import {
  AuthRequiredGuard,
  OptionalAuthGuard,
  Uid,
  WithUser,
  WithUserGuard,
} from '../auth/auth.guards';
import { NodeService } from '../node/node.service';
import { canCommentOn } from '../node/node.permissions';
import { NotificationDispatcher } from '../notifications/notification.dispatcher';

import {
  COMMENTS_DEFAULT_TAKE,
  CommentService,
  type WireComment,
  type WireCommentsResponse,
} from './comment.service';

/** Anything other than the exact string `ASC` sorts descending. */
const toOrder = (value: unknown): 'ASC' | 'DESC' =>
  value === 'ASC' ? 'ASC' : 'DESC';

const toInt = (value: unknown, fallback: number, min = 0): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  return Number.isFinite(parsed) && parsed >= min ? parsed : fallback;
};

@Controller('nodes')
export class CommentController {
  constructor(
    private readonly comments: CommentService,
    private readonly nodes: NodeService,
    private readonly notifications: NotificationDispatcher,
  ) {}

  @Get(':id/comments')
  @UseGuards(OptionalAuthGuard)
  getComments(
    @Param('id') id: string,
    @Uid() uid: number,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Query('order') order?: string,
  ): Promise<WireCommentsResponse> {
    const nodeId = Number.parseInt(id, 10);

    if (!Number.isFinite(nodeId) || nodeId <= 0) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return this.comments.getComments(
      nodeId,
      // A non-positive `take` falls back rather than returning nothing.
      toInt(take, COMMENTS_DEFAULT_TAKE, 1),
      toInt(skip, 0),
      toOrder(order),
      uid,
    );
  }

  /**
   * Creates a comment, or updates one when `id` is supplied. Either way the
   * node's `commented_at` is re-synced afterwards.
   */
  @Post(':id/comments')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async createComment(
    @Param('id') id: string,
    @WithUser() user: User,
    @Body() body: { id?: number; text?: string; files?: Array<{ id?: number }> },
  ): Promise<{ comment: WireComment }> {
    const nodeId = this.parseId(id, ERROR_CODES.IncorrectData, HttpStatus.BAD_REQUEST);
    const node = await this.nodes.findLive(nodeId);

    // Boris accepts comments even though it is neither flow nor lab.
    if (!node || !canCommentOn(node)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    const text = typeof body?.text === 'string' ? body.text : '';
    const requested = (body?.files ?? [])
      .map(file => Number(file?.id))
      .filter(fileId => Number.isFinite(fileId) && fileId > 0);
    const fileIds = await this.comments.resolveFileIds(requested);

    const invalid = this.comments.validate(text, fileIds);

    if (invalid) {
      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
        invalid,
      );
    }

    const existingId = Number(body?.id ?? 0);
    let commentId: number;

    if (Number.isFinite(existingId) && existingId > 0) {
      const existing = await this.comments.findById(existingId);

      if (!existing || existing.nodeId !== nodeId) {
        throw new VaultException(
          ERROR_CODES.CommentNotFound,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!this.comments.canEdit(existing, user)) {
        throw new VaultException(
          ERROR_CODES.NotEnoughRights,
          HttpStatus.FORBIDDEN,
        );
      }

      const updated = await this.comments.update(existing, text, fileIds);
      commentId = updated.id;
    } else {
      const created = await this.comments.create(nodeId, user.id, text, fileIds);
      commentId = created.id;

      await this.comments.maybeSetNodeDescription(node, created);
      // Only a new comment is announced; editing one must not notify again.
      await this.notifications.commentCreated(created.id);
    }

    await this.comments.syncNodeCommentedAt(nodeId);

    return { comment: await this.comments.toWire(commentId, user.id) };
  }

  /** Sets or clears a like. Liking your own comment is refused. */
  @Post(':id/comments/:cid/likes')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async likeComment(
    @Param('cid') cid: string,
    @WithUser() user: User,
    @Body() body: { liked?: boolean },
  ): Promise<{ comment: WireComment }> {
    const commentId = this.parseId(
      cid,
      ERROR_CODES.IncorrectData,
      HttpStatus.BAD_REQUEST,
    );
    const comment = await this.comments.findById(commentId);

    if (!comment) {
      throw new VaultException(ERROR_CODES.CommentNotFound, HttpStatus.NOT_FOUND);
    }

    if (comment.userId === user.id) {
      throw new VaultException(
        ERROR_CODES.CantSaveComment,
        HttpStatus.BAD_REQUEST,
        'Нельзя оценить свой комментарий',
      );
    }

    await this.comments.setLike(commentId, user.id, Boolean(body?.liked));

    return { comment: await this.comments.toWire(commentId, user.id) };
  }

  /** Locks or restores a comment via `?is_locked=`. */
  @Delete(':id/comments/:cid')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async deleteComment(
    @Param('id') id: string,
    @Param('cid') cid: string,
    @Query('is_locked') isLocked: string,
    @WithUser() user: User,
  ): Promise<{ deleted_at: string | null }> {
    const nodeId = this.parseId(id, ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    const commentId = this.parseId(
      cid,
      ERROR_CODES.CommentNotFound,
      HttpStatus.NOT_FOUND,
    );

    const comment = await this.comments.findById(commentId, true);

    if (!comment || comment.nodeId !== nodeId) {
      throw new VaultException(ERROR_CODES.CommentNotFound, HttpStatus.NOT_FOUND);
    }

    if (!this.comments.canEdit(comment, user)) {
      throw new VaultException(ERROR_CODES.CommentNotFound, HttpStatus.NOT_FOUND);
    }

    const isLocking = isLocked === 'true';
    const deletedAt = await this.comments.setDeleted(comment, isLocking);

    await (isLocking
      ? this.notifications.commentDeleted(comment.id)
      : this.notifications.commentRestored(comment.id));

    await this.comments.syncNodeCommentedAt(nodeId);

    return {
      deleted_at: deletedAt ? toWireDate(deletedAt) : null,
    };
  }

  private parseId(
    value: string,
    code: string,
    status: HttpStatus,
  ): number {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new VaultException(code as never, status);
    }

    return parsed;
  }
}
