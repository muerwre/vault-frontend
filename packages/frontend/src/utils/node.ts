import { NODE_PLACEMENT, NodePlacement } from '@vault/common/constants';

import { Role } from '~/constants/auth';
import { NODE_LAYOUTS, NODE_TYPES } from '~/constants/node';
import { ICommentGroup, INode } from '~/types';
import { IUser } from '~/types/auth';
import {
  getBlockFiles,
  isBlockEmpty,
  stripBlockKey,
  TEXT_NODE_BLOCKS,
} from '~/utils/blocks';
import { path } from '~/utils/ramda';

type Placed = Pick<INode, 'is_promoted'>;

/** Names for placements, as used by the `flow`/`lab`/`profile` colours. */
export type PlacementName = 'flow' | 'lab' | 'profile';

const PLACEMENT_NAMES: Record<NodePlacement, PlacementName> = {
  [NODE_PLACEMENT.LAB]: 'lab',
  [NODE_PLACEMENT.FLOW]: 'flow',
  [NODE_PLACEMENT.PROFILE]: 'profile',
};

/** A node without a placement yet is about to go to the flow. */
export const getPlacementName = (node: Partial<Placed>): PlacementName =>
  PLACEMENT_NAMES[node.is_promoted ?? NODE_PLACEMENT.FLOW] ?? 'flow';

export const isLabNode = (node: Partial<Placed>): boolean =>
  node.is_promoted === NODE_PLACEMENT.LAB;

export const canEditNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], node) === path(['id'], user);

export const canEditComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  path(['role'], user) === Role.Admin ||
  path(['user', 'id'], comment) === path(['id'], user);

export const canLikeComment = (
  comment?: Partial<ICommentGroup>,
  user?: Partial<IUser>,
): boolean =>
  Boolean(
    user?.role &&
      user?.id &&
      user?.role !== Role.Guest &&
      user.id !== comment?.user?.id,
  );

export const canLikeNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean => path(['role'], user) !== Role.Guest;

/**
 * Admins star flow photos for the hero carousel, and any lab post for the lab's
 * heroes panel.
 */
export const canStarNode = (
  node?: Partial<INode>,
  user?: Partial<IUser>,
): boolean =>
  !!node &&
  !!user &&
  (node.is_promoted === NODE_PLACEMENT.LAB ||
    (node.is_promoted === NODE_PLACEMENT.FLOW &&
      node.type === NODE_TYPES.IMAGE)) &&
  user.role === Role.Admin;

/**
 * Drops content the node's type cannot carry, mirroring what the backend
 * keeps: text nodes keep their non-empty blocks and the files those show,
 * video nodes video blocks, photo nodes images, song nodes audio and images.
 * Lets a form that switched types send only what the final type uses. Types
 * not listed are left as they are.
 */
export const pruneNodeContent = (node: INode): INode => {
  switch (node.type) {
    case NODE_TYPES.TEXT: {
      const blocks = node.blocks
        .filter((it) => TEXT_NODE_BLOCKS.includes(it.type) && !isBlockEmpty(it))
        .map(stripBlockKey);

      return { ...node, blocks, files: getBlockFiles(blocks) };
    }

    case NODE_TYPES.VIDEO:
      return {
        ...node,
        blocks: node.blocks
          .filter((it) => it.type === 'video')
          .map(stripBlockKey),
        files: [],
      };

    case NODE_TYPES.IMAGE:
      return {
        ...node,
        blocks: [],
        files: node.files.filter((it) => it.type === 'image'),
      };

    case NODE_TYPES.AUDIO:
      return {
        ...node,
        blocks: [],
        files: node.files.filter(
          (it) => it.type === 'audio' || it.type === 'image',
        ),
      };

    default:
      return node;
  }
};

/** Aura shows the photos behind the page, so a song node needs at least one. */
export const canHaveAura = (node: Pick<INode, 'type' | 'files'>): boolean =>
  node.type === NODE_TYPES.AUDIO &&
  node.files.some((file) => file?.type === 'image');

/** Whether the node page renders as an aura rather than a regular post. */
export const isAuraNode = (node: INode): boolean =>
  node.settings?.layout === NODE_LAYOUTS.AURA && canHaveAura(node);
