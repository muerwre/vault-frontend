import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GUEST_USER_ID } from '@vault/common/constants';

import { OptionalAuthGuard, Uid } from '../auth/auth.guards';

import {
  SEARCH_DEFAULT_TAKE,
  SearchService,
  type WireSearchResponse,
} from './search.service';

/** Unparseable or non-positive paging values fall back rather than erroring. */
const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  /** Optional auth: guests see flow nodes only, authed viewers also see lab. */
  @Get('nodes')
  @UseGuards(OptionalAuthGuard)
  searchNodes(
    @Uid() uid: number,
    @Query('text') text?: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ): Promise<WireSearchResponse> {
    return this.search.searchNodes(
      text ?? '',
      toPositiveInt(take, SEARCH_DEFAULT_TAKE),
      toPositiveInt(skip, 0),
      uid !== GUEST_USER_ID,
    );
  }
}
