import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES, ROLES } from '@vault/common/constants';

import { VaultException } from '../../globals/exceptions';
import { Claims, OptionalAuthGuard, Uid } from '../auth/auth.guards';

import {
  FLOW_DEFAULT_TAKE,
  FLOW_DEFAULT_WINDOW_DAYS,
  NodeService,
  type WireFlowDiff,
  type WireGetNode,
  type WireRelated,
} from './node.service';

/** Query booleans arrive as the strings `"true"`/`"false"`. */
const toBool = (value: unknown): boolean => value === 'true' || value === true;

const toDate = (value: unknown, fallback: Date): Date => {
  if (typeof value !== 'string' || value === '') {
    return fallback;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

@Controller('nodes')
export class NodeController {
  constructor(private readonly nodes: NodeService) {}

  /**
   * The flow feed. Clients call this as `/nodes/` with a trailing slash.
   *
   * `start` is the newer bound and `end` the older one. Omitting them means
   * "now" and "30 days ago" respectively.
   */
  @Get()
  @UseGuards(OptionalAuthGuard)
  getFlowDiff(
    @Uid() uid: number,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('take') take?: string,
    @Query('with_heroes') withHeroes?: string,
    @Query('with_updated') withUpdated?: string,
    @Query('with_recent') withRecent?: string,
    @Query('with_valid') withValid?: string,
  ): Promise<WireFlowDiff> {
    const now = new Date();
    const startDate = toDate(start, now);

    return this.nodes.getFlowDiff({
      start: startDate,
      end: toDate(
        end,
        new Date(now.getTime() - FLOW_DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000),
      ),
      take: toPositiveInt(take, FLOW_DEFAULT_TAKE),
      withHeroes: toBool(withHeroes),
      withUpdated: toBool(withUpdated),
      withRecent: toBool(withRecent),
      withValid: toBool(withValid),
      uid,
    });
  }

  /** Public. An unknown or untagged node yields empty results, not a 404. */
  @Get(':id/related')
  getRelated(@Param('id') id: string): Promise<WireRelated> {
    const nodeId = Number.parseInt(id, 10);

    if (!Number.isFinite(nodeId) || nodeId <= 0) {
      throw new VaultException(ERROR_CODES.IncorrectData, HttpStatus.BAD_REQUEST);
    }

    return this.nodes.getRelated(nodeId);
  }

  /** A missing or non-numeric id is a 404, not a validation error. */
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getNode(
    @Param('id') id: string,
    @Uid() uid: number,
    @Claims() claims: { rol?: string } | null,
  ): Promise<WireGetNode> {
    const nodeId = Number.parseInt(id, 10);

    if (!Number.isFinite(nodeId) || nodeId <= 0) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    const result = await this.nodes.getNode(
      nodeId,
      uid,
      claims?.rol ?? ROLES.GUEST,
    );

    if (!result) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return result;
  }
}
