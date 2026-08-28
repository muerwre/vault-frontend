import type { INodeBlock, INodeFlow } from '@vault/common/types';

import type { File } from '../entities/file.entity';
import type { Node } from '../entities/node.entity';
import type { User } from '../entities/user.entity';

/** Wire serialisation. The output shapes here are a frozen client contract. */

/** Wire representation of a null date. */
export const GO_ZERO_TIME = '0001-01-01T00:00:00Z';

/** RFC3339 UTC, no fractional seconds. Null dates become {@link GO_ZERO_TIME}. */
export const toWireDate = (value: Date | string | null | undefined): string => {
  if (value === null || value === undefined) {
    return GO_ZERO_TIME;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return GO_ZERO_TIME;
  }

  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/** For the few date fields that are nullable on the wire, e.g. `deleted_at`. */
export const toWireDateOrNull = (
  value: Date | string | null | undefined,
): string | null => (value === null || value === undefined ? null : toWireDate(value));

/** Null strings are `""` on the wire, never `null`. */
export const toWireString = (value: string | null | undefined): string =>
  value === null || value === undefined ? '' : value;

/** All three keys are always present, even when the stored blob is null. */
export const toWireFlow = (flow: INodeFlow | null | undefined): INodeFlow => ({
  display: flow?.display ?? '',
  show_description: flow?.show_description ?? false,
  dominant_color: flow?.dominant_color ?? '',
});

/**
 * Every block carries all three keys: a text block has an empty `url`, a video
 * block an empty `text`. Storage keeps only the used key.
 */
export const toWireBlocks = (
  blocks: INodeBlock[] | null | undefined,
): Array<{ type: string; text: string; url: string }> =>
  (blocks ?? []).map(block => ({
    type: block?.type ?? '',
    text: (block as { text?: string })?.text ?? '',
    url: (block as { url?: string })?.url ?? '',
  }));

/** `photo` is the file url, not an object. */
export interface WireShallowUser {
  id: number;
  username: string;
  photo: string;
}

/** A missing user serialises as the zero object, not `null`. */
export const toWireShallowUser = (
  user: (Pick<User, 'id' | 'username'> & { photo?: File | null }) | null | undefined,
): WireShallowUser => ({
  id: user?.id ?? 0,
  username: toWireString(user?.username),
  photo: toWireString(user?.photo?.url),
});

export interface WireShallowNode {
  id: number;
  title: string;
  type: string;
  thumbnail: string;
  description: string;
  commented_at: string;
  created_at: string;
  flow: INodeFlow;
  user: WireShallowUser;
  is_promoted: boolean;
}

export const toWireShallowNode = (node: Node): WireShallowNode => ({
  id: node.id,
  title: toWireString(node.title),
  type: toWireString(node.type),
  thumbnail: toWireString(node.thumbnail),
  description: toWireString(node.description),
  commented_at: toWireDate(node.commentedAt),
  created_at: toWireDate(node.createdAt),
  flow: toWireFlow(node.flow),
  user: toWireShallowUser(node.user),
  is_promoted: Boolean(node.isPromoted),
});
