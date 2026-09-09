import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';

import { VaultException } from '../../globals/exceptions';
import { OptionalAuthGuard, Uid } from '../auth/auth.guards';

import {
  COMMENTS_DEFAULT_TAKE,
  CommentService,
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
  constructor(private readonly comments: CommentService) {}

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
}
