import type {
  FlowDisplayVariant,
  ImageBlockMode,
  NodeLayout,
  NodeType,
} from '../constants/node';

import type { IFile } from './file';
import type { ITag } from './tag';
import type { IUser } from './user';

export interface IBlockText {
  type: 'text';
  text: string;
}

export interface IBlockEmbed {
  type: 'video';
  url: string;
}

/**
 * Photos shown together in a text node. Stored as file ids; the wire fills in
 * the files themselves from the node's own.
 */
export interface IBlockImages<F = number> {
  type: 'images';
  mode: ImageBlockMode;
  files: F[];
}

/** Songs played in a text node. Stored and sent like `IBlockImages`. */
export interface IBlockAudio<F = number> {
  type: 'audio';
  files: F[];
}

/** `node.blocks` JSON blob is an array of these. */
export type INodeBlock = IBlockText | IBlockEmbed | IBlockImages | IBlockAudio;

/** A block as sent to clients: file blocks carry the files, not their ids. */
export type IWireNodeBlock =
  | IBlockText
  | IBlockEmbed
  | IBlockImages<IFile>
  | IBlockAudio<IFile>;

/**
 * `node.flow` JSON blob.
 *
 * `display` is **not** restricted to the four variants: `''` is common, and most
 * nodes have no `flow` blob at all. Treat `''`/absent as unset and fall back to
 * the default rendering; never validate this field against the enum.
 */
export interface INodeFlow {
  display: FlowDisplayVariant | '';
  show_description: boolean;
  dominant_color?: string;
}

/**
 * Per-node page settings. Every key is optional and absent means the default,
 * so most nodes store none at all.
 */
export interface INodeSettings {
  layout?: NodeLayout;
}

/** A `node_social_publications` row surfaced as a backlink. */
export interface INodeBackLink {
  provider: string;
  link: string;
}

/** Wire shape of a node. Mirrors the frontend's `INode`. */
export interface INode {
  id: number;
  title: string;
  type?: NodeType;
  user?: Partial<IUser>;

  files: IFile[];
  cover?: IFile;
  tags: ITag[];

  blocks: IWireNodeBlock[];
  flow: INodeFlow;
  settings?: INodeSettings;

  thumbnail?: string;
  description?: string;

  is_public?: boolean;
  is_promoted?: boolean;
  is_heroic?: boolean;

  /** Computed per-request, not persisted. */
  is_liked?: boolean;
  /** Computed per-request, not persisted. */
  like_count?: number;

  backlinks?: INodeBackLink[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  commented_at?: string;
}

/** Trimmed node used by the flow feed. */
export type IFlowNode = Pick<
  INode,
  'id' | 'type' | 'flow' | 'description' | 'title' | 'thumbnail' | 'created_at'
>;
