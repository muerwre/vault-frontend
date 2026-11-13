import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES, GUEST_USER_ID } from '@vault/common/constants';

import { VaultException } from '../../globals/exceptions';
import type { WireProfile, WireShallowNode } from '../../wire/serialize';
import { OptionalAuthGuard, Uid } from '../auth/auth.guards';

import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  /** Public profile. Unknown or deleted usernames are a 404. */
  @Get(':username')
  async getProfile(
    @Param('username') username: string,
  ): Promise<{ user: WireProfile }> {
    const user = username ? await this.users.getProfile(username) : null;

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    return { user };
  }

  /**
   * A user's nodes. `after` is an ISO `created_at` cursor; omitting it returns
   * the newest page. An unparseable value is ignored rather than rejected.
   */
  @Get(':username/nodes')
  @UseGuards(OptionalAuthGuard)
  async getUserNodes(
    @Param('username') username: string,
    @Uid() uid: number,
    @Query('after') after?: string,
  ): Promise<{ nodes: WireShallowNode[] }> {
    const user = username ? await this.users.findByUsername(username) : null;

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    const cursor = after ? new Date(after) : null;

    return {
      nodes: await this.users.getUserNodes(
        user.id,
        uid !== GUEST_USER_ID,
        cursor && !Number.isNaN(cursor.getTime()) ? cursor : null,
      ),
    };
  }
}
