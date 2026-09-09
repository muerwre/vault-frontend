import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FILE_TYPES,
  FLOW_NODE_TYPES,
  UPLOAD_TARGETS,
  type NodeType,
} from '@vault/common/constants';
import type { INodeBlock, INodeFlow } from '@vault/common/types';
import { In, Repository } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import type { User } from '../../entities/user.entity';

import {
  deriveDescription,
  deriveDominantColor,
  deriveThumbnail,
  filterBlocks,
  filterFiles,
  truncateTitle,
  validateNodeContent,
} from './node.content';
import { canCreateNode, canEditNode } from './node.permissions';

/** What the client may send. Anything else in the body is ignored. */
export interface NodeUpsertBody {
  id?: number;
  title?: string;
  type?: string;
  is_public?: boolean;
  is_promoted?: boolean;
  thumbnail?: string;
  description?: string;
  blocks?: INodeBlock[];
  cover?: { id?: number } | null;
  files?: Array<{ id?: number; metadata?: { title?: string } } | null>;
  flow?: INodeFlow;
}

export type UpsertFailure =
  | { kind: 'forbidden' }
  | { kind: 'not-found' }
  | { kind: 'wrong-type' }
  | { kind: 'invalid'; message: string };

export type UpsertResult =
  | { ok: true; nodeId: number }
  | { ok: false; failure: UpsertFailure };

/** Only these types can be authored; `webm` and `boris` are not creatable. */
const CREATABLE_TYPES: readonly string[] = FLOW_NODE_TYPES;

/** Files a node may reference, regardless of node type. */
const NODE_FILE_TYPES = [FILE_TYPES.IMAGE, FILE_TYPES.AUDIO];

@Injectable()
export class NodeUpsertService {
  constructor(
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(File) private readonly files: Repository<File>,
  ) {}

  /**
   * Creates a node, or updates one when `id` is supplied.
   *
   * Derived fields (`description`, `thumbnail`, `flow.dominant_color`) are
   * recomputed from the resolved content on every write, so they cannot be set
   * directly by a client.
   */
  async upsert(body: NodeUpsertBody, user: User): Promise<UpsertResult> {
    if (!canCreateNode(user)) {
      return { ok: false, failure: { kind: 'forbidden' } };
    }

    const id = Number(body?.id ?? 0);
    const isUpdate = Number.isFinite(id) && id > 0;

    let node: Node;

    if (isUpdate) {
      const existing = await this.nodes
        .createQueryBuilder('node')
        .where('node.id = :id AND node.deleted_at IS NULL', { id })
        .getOne();

      if (!existing) {
        return { ok: false, failure: { kind: 'not-found' } };
      }

      /**
       * Editing is gated on the *stored* type, so a node whose type is not
       * authorable cannot be edited even by its owner.
       */
      if (!CREATABLE_TYPES.includes(existing.type)) {
        return { ok: false, failure: { kind: 'wrong-type' } };
      }

      if (!canEditNode(existing, user)) {
        return { ok: false, failure: { kind: 'forbidden' } };
      }

      node = existing;
    } else {
      const type = String(body?.type ?? '');

      if (!CREATABLE_TYPES.includes(type)) {
        return { ok: false, failure: { kind: 'wrong-type' } };
      }

      node = this.nodes.create({
        type: type as NodeType,
        userId: user.id,
        // New nodes start visible and promoted; the body can override below.
        isPublic: true,
        isPromoted: true,
        blocks: [],
        filesOrder: [],
      });
    }

    const type = node.type;
    const previousFileIds = isUpdate ? [...(node.filesOrder ?? [])] : [];

    const resolvedFiles = await this.resolveFiles(type, body?.files ?? []);
    const blocks = filterBlocks(type, body?.blocks);

    /**
     * Validated against the files that actually exist and match the node type,
     * rather than the types the client claimed — otherwise a bogus payload
     * silently produces an empty node.
     */
    const invalid = validateNodeContent(type, resolvedFiles, blocks);

    if (invalid) {
      return { ok: false, failure: { kind: 'invalid', message: invalid } };
    }

    const cover = await this.resolveCover(body?.cover);

    node.title = truncateTitle(String(body?.title ?? node.title ?? ''));
    node.blocks = blocks;
    node.filesOrder = resolvedFiles.map(file => file.id);
    node.coverId = cover?.id ?? null;

    if (typeof body?.is_public === 'boolean') {
      node.isPublic = body.is_public;
    }

    if (typeof body?.is_promoted === 'boolean') {
      node.isPromoted = body.is_promoted;
    }

    node.description = deriveDescription(type, blocks, node.description ?? '');
    node.thumbnail = deriveThumbnail(
      type,
      resolvedFiles,
      blocks,
      node.thumbnail ?? '',
    );

    const flow: INodeFlow = {
      display: body?.flow?.display ?? node.flow?.display ?? '',
      show_description:
        body?.flow?.show_description ?? node.flow?.show_description ?? false,
      dominant_color: deriveDominantColor(
        type,
        resolvedFiles,
        body?.flow?.dominant_color ?? node.flow?.dominant_color ?? '',
      ),
    };
    node.flow = flow;

    const saved = await this.nodes.save(node);

    await this.setNodeFiles(saved.id, node.filesOrder);
    await this.applyAudioTitles(body?.files ?? [], resolvedFiles);

    // Attached files belong to this node; files dropped from it are released.
    await this.setFilesTarget(node.filesOrder, UPLOAD_TARGETS.NODES);
    await this.setFilesTarget(
      previousFileIds.filter(fileId => !node.filesOrder.includes(fileId)),
      null,
    );

    return { ok: true, nodeId: saved.id };
  }

  /** Loads the requested files, keeping request order and dropping the unusable. */
  private async resolveFiles(
    type: NodeType,
    requested: NodeUpsertBody['files'],
  ): Promise<File[]> {
    const ids = (requested ?? [])
      .map(file => Number(file?.id))
      .filter(id => Number.isFinite(id) && id > 0);

    if (ids.length === 0) {
      return [];
    }

    const rows = await this.files.find({
      where: { id: In(ids), type: In(NODE_FILE_TYPES) },
    });
    const byId = new Map(rows.map(file => [file.id, file]));

    const ordered = ids
      .map(id => byId.get(id))
      .filter((file): file is File => file !== undefined);

    return filterFiles(type, ordered);
  }

  private async resolveCover(
    cover: NodeUpsertBody['cover'],
  ): Promise<File | null> {
    const id = Number(cover?.id ?? 0);

    if (!Number.isFinite(id) || id <= 0) {
      return null;
    }

    return this.files.findOne({ where: { id } });
  }

  /** Rewrites the junction so stored rows match `files_order`. */
  private async setNodeFiles(nodeId: number, fileIds: number[]): Promise<void> {
    await this.nodes.manager.transaction(async manager => {
      await manager.query('DELETE FROM node_files_file WHERE nodeId = ?', [nodeId]);

      if (fileIds.length > 0) {
        await manager.query(
          `INSERT INTO node_files_file (nodeId, fileId) VALUES ${fileIds
            .map(() => '(?, ?)')
            .join(', ')}`,
          fileIds.flatMap(id => [nodeId, id]),
        );
      }
    });
  }

  private async setFilesTarget(
    fileIds: number[],
    target: string | null,
  ): Promise<void> {
    if (fileIds.length === 0) {
      return;
    }

    await this.files.update({ id: In(fileIds) }, { target: target as never });
  }

  /**
   * Audio files carry a user-editable track title in their metadata, so a
   * changed title on an incoming audio file is persisted. Nothing else in a
   * client-supplied file is trusted.
   */
  private async applyAudioTitles(
    requested: NodeUpsertBody['files'],
    resolved: File[],
  ): Promise<void> {
    const byId = new Map(resolved.map(file => [file.id, file]));

    for (const incoming of requested ?? []) {
      const id = Number(incoming?.id ?? 0);
      const file = byId.get(id);
      const title = incoming?.metadata?.title;

      if (
        !file ||
        file.type !== FILE_TYPES.AUDIO ||
        typeof title !== 'string' ||
        title === file.metadata?.title
      ) {
        continue;
      }

      await this.files.update(id, {
        metadata: { ...(file.metadata ?? {}), title },
      });
    }
  }
}
