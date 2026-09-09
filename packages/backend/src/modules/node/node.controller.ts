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
import {
  ERROR_CODES,
  NODE_FLOW_DISPLAY,
  ROLES,
} from '@vault/common/constants';
import type { INodeFlow } from '@vault/common/types';

import { Tag } from '../../entities/tag.entity';
import { User } from '../../entities/user.entity';
import { VaultException } from '../../globals/exceptions';
import {
  AuthRequiredGuard,
  Claims,
  OptionalAuthGuard,
  Uid,
  WithUser,
  WithUserGuard,
} from '../auth/auth.guards';

import { TagService } from '../tag/tag.service';

import {
  LabService,
  normaliseLabQuery,
  type WireLabList,
  type WireLabStats,
} from './lab.service';
import { NodeTagsService } from './node-tags.service';
import {
  NodeUpsertService,
  type NodeUpsertBody,
} from './node-upsert.service';

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

const FLOW_DISPLAYS: readonly string[] = Object.values(NODE_FLOW_DISPLAY);

const toPositiveInt = (value: unknown, fallback: number): number => {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

@Controller('nodes')
export class NodeController {
  constructor(
    private readonly nodes: NodeService,
    private readonly nodeTags: NodeTagsService,
    private readonly tags: TagService,
    private readonly lab: LabService,
    private readonly upsert: NodeUpsertService,
  ) {}

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

  /**
   * Creates or updates a node. Derived fields (`description`, `thumbnail`,
   * `flow.dominant_color`) are recomputed server-side and cannot be set here.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async save(
    @WithUser() user: User,
    @Body() body: NodeUpsertBody,
  ): Promise<{ node: WireGetNode['node'] }> {
    const result = await this.upsert.upsert(body ?? {}, user);

    if (result.ok !== true) {
      throw this.upsertError(result.failure);
    }

    return { node: await this.reloadNode(result.nodeId, user) };
  }

  /**
   * The lab feed. Declared before `:id` so the literal path is not captured as
   * a node id.
   */
  @Get('lab')
  @UseGuards(AuthRequiredGuard)
  getLab(
    @Uid() uid: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ): Promise<WireLabList> {
    const query = normaliseLabQuery({ limit, offset, sort, search });

    return this.lab.getList(
      query.limit,
      query.offset,
      query.sort,
      query.search,
      uid,
    );
  }

  @Get('lab/updates')
  @UseGuards(AuthRequiredGuard)
  getLabUpdates(@Uid() uid: number): Promise<{ nodes: unknown[] }> {
    return this.lab.getUpdates(uid);
  }

  @Get('lab/stats')
  @UseGuards(AuthRequiredGuard)
  getLabStats(): Promise<WireLabStats> {
    return this.lab.getStats();
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

  /** Toggles the caller's like. Returns the resulting state. */
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async like(
    @Param('id') id: string,
    @WithUser() user: User,
  ): Promise<{ is_liked: boolean }> {
    const node = await this.nodes.findLive(this.parseId(id, HttpStatus.NOT_FOUND));

    if (!node) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return { is_liked: await this.nodes.toggleLike(node, user) };
  }

  /** Admin only. Toggles the heroic flag and returns the new value. */
  @Post(':id/heroic')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async heroic(
    @Param('id') id: string,
    @WithUser() user: User,
  ): Promise<{ is_heroic: boolean }> {
    const node = await this.nodes.findLive(
      this.parseId(id, HttpStatus.BAD_REQUEST),
    );

    if (!node || !this.nodes.canHero(node, user)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return { is_heroic: await this.nodes.toggleHeroic(node) };
  }

  /**
   * Persists the flow grid display settings.
   *
   * Unlike reads, this **requires** a known display variant — an empty string is
   * rejected here even though stored rows may contain one.
   */
  @Post(':id/cell-view')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async cellView(
    @Param('id') id: string,
    @WithUser() user: User,
    @Body() body: { flow?: INodeFlow },
  ): Promise<{ flow: INodeFlow }> {
    const flow = body?.flow;

    if (!flow || !FLOW_DISPLAYS.includes(flow.display)) {
      throw new VaultException(ERROR_CODES.IncorrectData, HttpStatus.BAD_REQUEST);
    }

    const node = await this.nodes.findLive(
      this.parseId(id, HttpStatus.BAD_REQUEST),
    );

    if (!node || !this.nodes.canEdit(node, user)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return { flow: await this.nodes.setFlow(node, flow) };
  }

  /**
   * Locks or restores a node via `?is_locked=`. Locking soft-deletes it, so this
   * looks up the node including already-deleted ones.
   */
  @Delete(':id')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async remove(
    @Param('id') id: string,
    @Query('is_locked') isLocked: string,
    @WithUser() user: User,
  ): Promise<{ deleted_at: string | null }> {
    const node = await this.nodes.findForEdit(
      this.parseId(id, HttpStatus.BAD_REQUEST),
    );

    if (!node || !this.nodes.canEdit(node, user)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return {
      deleted_at: await this.nodes.setLocked(node, toBool(isLocked)),
    };
  }

  /**
   * Adds tags to a node, creating any that do not exist yet. An empty list is a
   * no-op that still returns the node.
   */
  @Post(':id/tags')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async addTags(
    @Param('id') id: string,
    @WithUser() user: User,
    @Body() body: { tags?: string[] },
  ): Promise<{ node: WireGetNode['node'] }> {
    const nodeId = this.parseId(id, HttpStatus.BAD_REQUEST);
    const node = await this.nodes.findLive(nodeId);

    if (!node || !this.nodes.canEdit(node, user)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.BAD_REQUEST);
    }

    const titles = Array.isArray(body?.tags) ? body.tags : [];

    if (titles.length > 0) {
      const resolved = await this.tags.findOrCreateByTitles(titles);
      await this.nodeTags.addTags(nodeId, resolved);
    }

    return { node: await this.reloadNode(nodeId, user) };
  }

  /** Removes one tag from a node and returns the remaining set. */
  @Delete(':id/tags/:tagId')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async removeTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @WithUser() user: User,
  ): Promise<{ tags: Array<{ ID: number; title: string }> }> {
    const nodeId = this.parseId(id, HttpStatus.BAD_REQUEST);
    const parsedTagId = Number.parseInt(tagId, 10);

    if (!Number.isFinite(parsedTagId) || parsedTagId <= 0) {
      throw new VaultException(ERROR_CODES.TagNotFound, HttpStatus.BAD_REQUEST);
    }

    const node = await this.nodes.findLive(nodeId);

    if (!node || !this.nodes.canEdit(node, user)) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    const remaining = await this.nodeTags.removeTag(nodeId, parsedTagId);

    return { tags: remaining.map((tag: Tag) => ({ ID: tag.id, title: tag.title })) };
  }

  /** Re-reads the node so the response reflects the write. */
  private async reloadNode(
    nodeId: number,
    user: User,
  ): Promise<WireGetNode['node']> {
    const result = await this.nodes.getNode(nodeId, user.id, user.role);

    if (!result) {
      throw new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
    }

    return result.node;
  }

  private upsertError(failure: {
    kind: string;
    message?: string;
  }): VaultException {
    switch (failure.kind) {
      case 'forbidden':
        return new VaultException(
          ERROR_CODES.NotEnoughRights,
          HttpStatus.FORBIDDEN,
        );
      case 'not-found':
        return new VaultException(ERROR_CODES.NodeNotFound, HttpStatus.NOT_FOUND);
      case 'wrong-type':
        return new VaultException(
          ERROR_CODES.IncorrectType,
          HttpStatus.BAD_REQUEST,
        );
      default:
        return new VaultException(
          ERROR_CODES.IncorrectData,
          HttpStatus.BAD_REQUEST,
          failure.message,
        );
    }
  }

  private parseId(id: string, onInvalid: HttpStatus): number {
    const parsed = Number.parseInt(id, 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new VaultException(
        onInvalid === HttpStatus.NOT_FOUND
          ? ERROR_CODES.NodeNotFound
          : ERROR_CODES.IncorrectData,
        onInvalid,
      );
    }

    return parsed;
  }
}
