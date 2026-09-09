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

/** File. `orig_name`, `full_path`, `target` and the owner are never exposed. */
export interface WireFile {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  path: string;
  url: string;
  size: number;
  type: string;
  mime: string;
  metadata: Record<string, unknown>;
}

export const toWireFile = (file: File): WireFile => ({
  id: file.id,
  created_at: toWireDate(file.createdAt),
  updated_at: toWireDate(file.updatedAt),
  deleted_at: toWireDateOrNull(file.deletedAt),
  name: toWireString(file.name),
  path: toWireString(file.path),
  url: toWireString(file.url),
  size: Number(file.size ?? 0),
  type: toWireString(file.type),
  mime: toWireString(file.mime),
  metadata: (file.metadata ?? {}) as Record<string, unknown>,
});

/**
 * User as embedded in nodes and comments. Deliberately excludes `email`,
 * `is_activated` and the `last_seen_*` fields other than `last_seen` — the
 * authenticated-self shape is wider and lives with the auth endpoints.
 */
export interface WireUser {
  id: number;
  username: string;
  role: string;
  fullname: string;
  description: string;
  photo: WireFile | null;
  cover: WireFile | null;
  last_seen: string;
}

export const toWireUser = (user: User | null | undefined): WireUser | null =>
  user
    ? {
        id: user.id,
        username: toWireString(user.username),
        role: toWireString(user.role),
        fullname: toWireString(user.fullname),
        description: toWireString(user.description),
        photo: user.photo ? toWireFile(user.photo) : null,
        cover: user.cover ? toWireFile(user.cover) : null,
        last_seen: toWireDate(user.lastSeen),
      }
    : null;

/** Tag. The key is uppercase `ID`; `data` and timestamps are not exposed. */
export interface WireTag {
  ID: number;
  title: string;
}

export const toWireTag = (tag: { id: number; title: string | null }): WireTag => ({
  ID: tag.id,
  title: toWireString(tag.title),
});

/** Full node, as returned by `GET /nodes/:id`. */
export interface WireNode {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  title: string;
  type: string;
  is_public: boolean;
  is_promoted: boolean;
  is_heroic: boolean;
  thumbnail: string;
  description: string;
  blocks: Array<{ type: string; text: string; url: string }>;
  cover: WireFile | null;
  user: WireUser | null;
  files_order: number[];
  files: WireFile[];
  tags: WireTag[];
  commented_at: string;
  flow: INodeFlow;
  is_liked: boolean;
  like_count: number;
}

/**
 * `files` must already be ordered by `files_order`; see `sortFilesByOrder`.
 * `isLiked`/`likeCount` are computed per request and default to the guest view.
 */
export const toWireNode = (
  node: Node,
  files: File[] = [],
  extra: { isLiked?: boolean; likeCount?: number } = {},
): WireNode => ({
  id: node.id,
  created_at: toWireDate(node.createdAt),
  updated_at: toWireDate(node.updatedAt),
  deleted_at: toWireDateOrNull(node.deletedAt),
  title: toWireString(node.title),
  type: toWireString(node.type),
  is_public: Boolean(node.isPublic),
  is_promoted: Boolean(node.isPromoted),
  is_heroic: Boolean(node.isHeroic),
  thumbnail: toWireString(node.thumbnail),
  description: toWireString(node.description),
  blocks: toWireBlocks(node.blocks),
  cover: node.cover ? toWireFile(node.cover) : null,
  user: toWireUser(node.user),
  files_order: node.filesOrder ?? [],
  files: files.map(toWireFile),
  tags: (node.tags ?? []).map(toWireTag),
  commented_at: toWireDate(node.commentedAt),
  flow: toWireFlow(node.flow),
  is_liked: extra.isLiked ?? false,
  like_count: extra.likeCount ?? 0,
});

/**
 * Orders files by an explicit id list. Ids with no matching row are dropped
 * rather than left as holes in the array.
 */
export const sortFilesByOrder = (files: File[], order: number[]): File[] => {
  if (order.length === 0 || files.length === 0) {
    return files;
  }

  const byId = new Map(files.map(file => [file.id, file]));

  return order
    .map(id => byId.get(id))
    .filter((file): file is File => file !== undefined);
};

/** Compact file used by profiles: no paths, no timestamps. */
export interface WireShallowFile {
  id: number;
  url: string;
  metadata: Record<string, unknown>;
  type: string;
  mime: string;
  size: number;
}

export const toWireShallowFile = (
  file: File | null | undefined,
): WireShallowFile | null =>
  file
    ? {
        id: file.id,
        url: toWireString(file.url),
        metadata: (file.metadata ?? {}) as Record<string, unknown>,
        type: toWireString(file.type),
        mime: toWireString(file.mime),
        size: Number(file.size ?? 0),
      }
    : null;

/**
 * Public profile. Narrower than the user embedded in nodes: it carries
 * `created_at` but no `last_seen`, and its files are the shallow shape.
 */
export interface WireProfile {
  id: number;
  created_at: string;
  username: string;
  role: string;
  fullname: string;
  description: string;
  cover: WireShallowFile | null;
  photo: WireShallowFile | null;
}

export const toWireProfile = (user: User): WireProfile => ({
  id: user.id,
  created_at: toWireDate(user.createdAt),
  username: toWireString(user.username),
  role: toWireString(user.role),
  fullname: toWireString(user.fullname),
  description: toWireString(user.description),
  cover: toWireShallowFile(user.cover),
  photo: toWireShallowFile(user.photo),
});
