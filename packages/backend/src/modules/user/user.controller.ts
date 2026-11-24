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
import { parseQueryBool } from '../../globals/query';
import type { WireProfile, WireProfileNode } from '../../wire/serialize';
import { OptionalAuthGuard, Uid } from '../auth/auth.guards';

import { UserService, type WireProfileItem } from './user.service';

/** Longer search text is cut to this. */
const MAX_USER_NODES_SEARCH_LENGTH = 64;

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
   * the newest page. An unparseable value is ignored rather than rejected, and
   * so is a `limit` outside the accepted range. `full=true` returns lab-card
   * items, with whole nodes, instead of flow cells. `search` filters by title
   * and description; only its first `MAX_USER_NODES_SEARCH_LENGTH`
   * characters count.
   */
  @Get(':username/nodes')
  @UseGuards(OptionalAuthGuard)
  async getUserNodes(
    @Param('username') username: string,
    @Uid() uid: number,
    @Query('after') after?: string,
    @Query('limit') limit?: string,
    @Query('full') full?: string,
    @Query('search') search?: string,
  ): Promise<{ nodes: WireProfileNode[] | WireProfileItem[] }> {
    const user = username ? await this.users.findByUsername(username) : null;

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    const cursor = after ? new Date(after) : null;

    return {
      nodes: await this.users.getUserNodes(user.id, uid, {
        after: cursor && !Number.isNaN(cursor.getTime()) ? cursor : null,
        limit: limit ? Number(limit) : undefined,
        full: parseQueryBool(full) === true,
        search:
          typeof search === 'string'
            ? search.trim().slice(0, MAX_USER_NODES_SEARCH_LENGTH)
            : '',
      }),
    };
  }
}
