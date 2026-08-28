import type { FlowDisplayVariant, NodeType } from '../constants/node';

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

/** `node.blocks` JSON blob is an array of these. */
export type INodeBlock = IBlockText | IBlockEmbed;

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

  blocks: INodeBlock[];
  flow: INodeFlow;

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
  'id' | 'flow' | 'description' | 'title' | 'thumbnail' | 'created_at'
>;
