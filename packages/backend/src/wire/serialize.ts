import {
  FILE_TYPES,
  MAX_LIST_SONGS,
  NODE_PLACEMENT,
  PROFILE_NODES_VIEW,
  type NodePlacement,
  type ProfileNodesView,
} from '@vault/common/constants';
import type {
  INodeBlock,
  INodeFlow,
  INodeSettings,
  IProfileInfoItem,
} from '@vault/common/types';

import { isYoutubeThumbCacheEnabled } from '../config/env';
import type { File } from '../entities/file.entity';
import type { Node } from '../entities/node.entity';
import type { UserProfile } from '../entities/user-profile.entity';
import type { User } from '../entities/user.entity';
import { localizeYoutubeThumb } from '../modules/upload/upload.paths';

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
): string | null =>
  value === null || value === undefined ? null : toWireDate(value);

/** Null strings are `""` on the wire, never `null`. */
export const toWireString = (value: string | null | undefined): string =>
  value === null || value === undefined ? '' : value;

/**
 * A node's thumbnail for the wire. Video covers are stored as YouTube urls and
 * swapped for our own copy here, so turning the cache off needs no data change.
 */
export const toWireThumbnail = (value: string | null | undefined): string => {
  const thumbnail = toWireString(value);

  return isYoutubeThumbCacheEnabled()
    ? localizeYoutubeThumb(thumbnail)
    : thumbnail;
};

/** All three keys are always present, even when the stored blob is null. */
export const toWireFlow = (flow: INodeFlow | null | undefined): INodeFlow => ({
  display: flow?.display ?? '',
  show_description: flow?.show_description ?? false,
  dominant_color: flow?.dominant_color ?? '',
});

/** A block on the wire. File blocks also carry `files`, photo blocks `mode`. */
export interface WireBlock {
  type: string;
  text: string;
  url: string;
  mode?: string;
  files?: WireFile[];
}

/**
 * Every block carries `type`, `text` and `url`: a text block has an empty
 * `url`, a video block an empty `text`. Storage keeps only the used key.
 * File blocks store ids, which become the node's matching `files`; ids the
 * node no longer has are skipped.
 */
export const toWireBlocks = (
  blocks: INodeBlock[] | null | undefined,
  files: File[] = [],
): WireBlock[] => {
  const byId = new Map(files.map((file) => [file.id, file]));

  return (blocks ?? []).map((block) => {
    const wire: WireBlock = {
      type: block?.type ?? '',
      text: (block as { text?: string })?.text ?? '',
      url: (block as { url?: string })?.url ?? '',
    };

    if (block?.type === 'images') {
      wire.mode = block.mode;
    }

    if (block?.type === 'images' || block?.type === 'audio') {
      wire.files = (block.files ?? [])
        .map((id) => byId.get(id))
        .filter((file): file is File => file !== undefined)
        .map(toWireFile);
    }

    return wire;
  });
};

/** `photo` is the file url, not an object. */
export interface WireShallowUser {
  id: number;
  username: string;
  photo: string;
}

/** A missing user serialises as the zero object, not `null`. */
export const toWireShallowUser = (
  user:
    | (Pick<User, 'id' | 'username'> & { photo?: File | null })
    | null
    | undefined,
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
  is_promoted: NodePlacement;
  /** Leads the author's profile, wherever the node is listed. */
  is_pinned: boolean;
  /** A song node's tracks, on the flow only, for its cell to play. */
  songs?: WireFile[];
}

/** A song node's audio files as its flow cell plays them. */
export const toWireFlowSongs = (files: File[]): WireFile[] =>
  files
    .filter((file) => file.type === FILE_TYPES.AUDIO)
    .slice(0, MAX_LIST_SONGS)
    .map(toWireFile);

/**
 * `is_promoted` carries the placement as stored: one of `NODE_PLACEMENT`.
 * Flow and lab keep their old 1/0, which read the same as the old booleans
 * to a client testing truthiness.
 */
export const toWirePlacement = (
  placement: number | null | undefined,
): { is_promoted: NodePlacement } => ({
  is_promoted: (Number(placement) || NODE_PLACEMENT.LAB) as NodePlacement,
});

export const toWireShallowNode = (node: Node): WireShallowNode => ({
  id: node.id,
  title: toWireString(node.title),
  type: toWireString(node.type),
  thumbnail: toWireThumbnail(node.thumbnail),
  description: toWireString(node.description),
  commented_at: toWireDate(node.commentedAt),
  created_at: toWireDate(node.createdAt),
  flow: toWireFlow(node.flow),
  user: toWireShallowUser(node.user),
  ...toWirePlacement(node.placement),
  is_pinned: Boolean(node.isPinned),
});

/**
 * How the node's cell looks on its author's profile: the profile's own
 * display, or the flow's when it has none. The colour is always the flow's.
 */
export const toWireProfileFlow = (
  node: Pick<Node, 'flow' | 'settings'>,
): INodeFlow => {
  const flow = toWireFlow(node.flow);
  const own = node.settings?.profile_flow;

  return own
    ? { ...flow, display: own.display, show_description: own.show_description }
    : flow;
};

/** A node as the profile grid lists it. */
export interface WireProfileNode extends WireShallowNode {
  /** `flow` is the profile's own rather than the flow's. */
  has_profile_flow: boolean;
}

export const toWireProfileNode = (node: Node): WireProfileNode => ({
  ...toWireShallowNode(node),
  flow: toWireProfileFlow(node),
  has_profile_flow: !!node.settings?.profile_flow,
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

export const toWireTag = (tag: {
  id: number;
  title: string | null;
}): WireTag => ({
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
  is_promoted: NodePlacement;
  /** Leads the author's profile, wherever the node is listed. */
  is_pinned: boolean;
  is_heroic: boolean;
  thumbnail: string;
  description: string;
  blocks: WireBlock[];
  cover: WireFile | null;
  user: WireUser | null;
  files_order: number[];
  files: WireFile[];
  tags: WireTag[];
  commented_at: string;
  flow: INodeFlow;
  settings: INodeSettings;
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
  ...toWirePlacement(node.placement),
  is_pinned: Boolean(node.isPinned),
  is_heroic: Boolean(node.isHeroic),
  thumbnail: toWireThumbnail(node.thumbnail),
  description: toWireString(node.description),
  blocks: toWireBlocks(node.blocks, files),
  cover: node.cover ? toWireFile(node.cover) : null,
  user: toWireUser(node.user),
  files_order: node.filesOrder ?? [],
  files: files.map(toWireFile),
  tags: (node.tags ?? []).map(toWireTag),
  commented_at: toWireDate(node.commentedAt),
  flow: toWireFlow(node.flow),
  settings: node.settings ?? {},
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

  const byId = new Map(files.map((file) => [file.id, file]));

  return order
    .map((id) => byId.get(id))
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
 * Additional info. Entries that are not a `{ title, value }` with a value
 * are dropped, so a malformed blob degrades to less info, not a broken page.
 */
export const toWireProfileInfo = (info: unknown): IProfileInfoItem[] =>
  Array.isArray(info)
    ? info.flatMap((item) =>
        item &&
        typeof item === 'object' &&
        typeof item.value === 'string' &&
        item.value
          ? [
              {
                title: typeof item.title === 'string' ? item.title : '',
                value: item.value,
              },
            ]
          : [],
      )
    : [];

const NODES_VIEWS: readonly string[] = Object.values(PROFILE_NODES_VIEW);

/** How the profile shows; unset or unknown reads as the flow. */
export const toWireNodesView = (view: unknown): ProfileNodesView =>
  typeof view === 'string' && NODES_VIEWS.includes(view)
    ? (view as ProfileNodesView)
    : PROFILE_NODES_VIEW.FLOW;

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
  about: string;
  about_display: string;
  info: IProfileInfoItem[];
  nodes_view: ProfileNodesView;
  cover: WireShallowFile | null;
  photo: WireShallowFile | null;
}

/** Profile page fields; a missing row serialises as an empty profile. */
const toWireProfileExtras = (profile: UserProfile | null | undefined) => ({
  about: toWireString(profile?.about),
  about_display: toWireString(profile?.aboutDisplay),
  info: toWireProfileInfo(profile?.settings?.info),
  nodes_view: toWireNodesView(profile?.settings?.nodes_view),
});

export const toWireProfile = (
  user: User,
  profile?: UserProfile | null,
): WireProfile => ({
  id: user.id,
  created_at: toWireDate(user.createdAt),
  username: toWireString(user.username),
  role: toWireString(user.role),
  fullname: toWireString(user.fullname),
  description: toWireString(user.description),
  ...toWireProfileExtras(profile),
  cover: toWireShallowFile(user.cover),
  photo: toWireShallowFile(user.photo),
});

/**
 * The authenticated user's own record, as returned by login, `GET /auth` and
 * profile updates. Wider than the user embedded in nodes: it exposes `email` and
 * `last_seen_boris`.
 */
export interface WireSelf {
  id: number;
  username: string;
  email: string;
  role: string;
  fullname: string;
  description: string;
  about: string;
  about_display: string;
  info: IProfileInfoItem[];
  nodes_view: ProfileNodesView;
  last_seen: string;
  /** Derived from this user's view of the Boris node; there is no such column. */
  last_seen_boris: string;
  photo: WireShallowFile | null;
  cover: WireShallowFile | null;
}

export const toWireSelf = (
  user: User,
  lastSeenBoris: Date | null,
  profile?: UserProfile | null,
): WireSelf => ({
  id: user.id,
  username: toWireString(user.username),
  email: toWireString(user.email),
  role: toWireString(user.role),
  fullname: toWireString(user.fullname),
  description: toWireString(user.description),
  ...toWireProfileExtras(profile),
  last_seen: toWireDate(user.lastSeen),
  last_seen_boris: toWireDate(lastSeenBoris),
  photo: toWireShallowFile(user.photo),
  cover: toWireShallowFile(user.cover),
});
