/**
 * Node types. The column enum has six members; `webm` exists in the data even
 * though no feed lists it. Narrowing this set rejects existing rows.
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

/** Column enum member order; the baseline migration must match it exactly. */
export const NODE_TYPE_ENUM_ORDER: readonly NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.AUDIO,
  NODE_TYPES.VIDEO,
  NODE_TYPES.TEXT,
  NODE_TYPES.WEBM,
  NODE_TYPES.BORIS,
];

/** Types listed in the flow feed. Excludes `webm` and `boris`. */
export const FLOW_NODE_TYPES: readonly NodeType[] = [
  NODE_TYPES.IMAGE,
  NODE_TYPES.VIDEO,
  NODE_TYPES.TEXT,
  NODE_TYPES.AUDIO,
];

/** Types listed in the lab feed — the same set as the flow. */
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

export const MAX_COMMENT_LENGTH = 8192;

/** Providers whose `node_social_publications` rows surface as node backlinks. */
export const NODE_BACKLINK_PROVIDERS = ['vkontakte'] as const;

/** Prefix on `node.thumbnail` meaning the image lives on the legacy media host. */
export const REMOTE_CURRENT_PREFIX = 'REMOTE_CURRENT:';
