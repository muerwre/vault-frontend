/**
 * Node types. The DB enum has **six** members — `webm` exists in the live schema
 * and in the data (68 rows) even though the Go constants omit it. Any entity or
 * validation that narrows this set would reject existing rows.
 */
export const NODE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text',
  WEBM: 'webm',
  BORIS: 'boris',
} as const;

export type NodeType = (typeof NODE_TYPES)[keyof typeof NODE_TYPES];

/** DB enum member order — the baseline migration must emit this exact order. */
export const NODE_TYPE_ENUM_ORDER: readonly NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.AUDIO,
  NODE_TYPES.VIDEO,
  NODE_TYPES.TEXT,
  NODE_TYPES.WEBM,
  NODE_TYPES.BORIS,
];

/** Types listed in the flow feed (Go `FlowNodeTypes`). Excludes `webm`/`boris`. */
export const FLOW_NODE_TYPES: readonly NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.VIDEO,
  NODE_TYPES.TEXT,
  NODE_TYPES.AUDIO,
];

/** Types listed in the lab feed (Go `LabNodeTypes` — same set as flow). */
export const LAB_NODE_TYPES: readonly NodeType[] = FLOW_NODE_TYPES;

export const NODE_FLOW_DISPLAY = {
  SINGLE: 'single',
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  QUADRO: 'quadro',
} as const;

export type FlowDisplayVariant =
  (typeof NODE_FLOW_DISPLAY)[keyof typeof NODE_FLOW_DISPLAY];

/** Lab sort modes accepted by `GET /nodes/lab`. */
export const LAB_SORT = {
  NEW: 'new',
  HOT: 'hot',
  HEROIC: 'heroic',
} as const;

export type LabSort = (typeof LAB_SORT)[keyof typeof LAB_SORT];

/** Boris is a singleton node addressed by a fixed id. */
export const BORIS_NODE_ID = 696;

export const MAX_NODE_TITLE_LENGTH = 256;

/** Go `MaxCommentLength = 4096 * 2`. */
export const MAX_COMMENT_LENGTH = 8192;

/**
 * Providers whose `node_social_publications` rows are surfaced as node
 * backlinks. Go validated against this list.
 */
export const NODE_BACKLINK_PROVIDERS = ['vkontakte'] as const;

/**
 * `node.thumbnail` may carry this prefix, meaning the image lives on the
 * previous-generation host rather than the current uploads dir.
 */
export const REMOTE_CURRENT_PREFIX = 'REMOTE_CURRENT:';
