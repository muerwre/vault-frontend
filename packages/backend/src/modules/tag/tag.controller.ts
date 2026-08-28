import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ERROR_CODES, GUEST_USER_ID } from '@vault/common/constants';

import { VaultException } from '../../globals/exceptions';
import { OptionalAuthGuard, Uid } from '../auth/auth.guards';

import { TagService, type WireTagNodesResponse } from './tag.service';

const toInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

@Controller('tags')
export class TagController {
  constructor(private readonly tags: TagService) {}

  @Get('nodes')
  @UseGuards(OptionalAuthGuard)
  async getNodesOfTag(
    @Uid() uid: number,
    @Query('name') name?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<WireTagNodesResponse> {
    const tag = await this.tags.findByName(name ?? '');

    if (!tag) {
      throw new VaultException(ERROR_CODES.TagNotFound, HttpStatus.NOT_FOUND);
    }

    return this.tags.getNodesOfTag(
      tag,
      uid === GUEST_USER_ID,
      toInt(limit, 0),
      toInt(offset, 0),
    );
  }

  /** Public. Failures answer `{ tags: [] }` so the tag input never errors. */
  @Get('autocomplete')
  async autocomplete(
    @Query('search') search?: string,
    @Query('exclude') exclude?: string | string[],
  ): Promise<{ tags: string[] }> {
    const excluded = (Array.isArray(exclude) ? exclude : [exclude ?? ''])
      .flatMap(value => value.split(','))
      .map(value => value.trim())
      .filter(Boolean);

    try {
      return { tags: await this.tags.autocomplete(search ?? '', excluded) };
    } catch {
      return { tags: [] };
    }
  }
}
