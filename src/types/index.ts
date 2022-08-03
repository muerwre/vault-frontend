import { Context } from "react";

import { ERRORS } from "~/constants/errors";
import { IUser } from "~/types/auth";

export interface ITag {
  ID: number;
  title: string;

  data: Record<string, string>;
  user: IUser;
  nodes: INode[];

  readonly created_at: string;
  readonly updated_at: string;
}

export type IIcon = string;

export type ValueOf<T> = T[keyof T];
export type ContextValue<T> = T extends Context<infer U> ? U : never;

export type UUID = string;

export type IUploadType = "image" | "text" | "audio" | "video" | "other";

export interface IFile {
  id: number;
  temp_id?: UUID;
  user_id?: UUID;
  node_id?: UUID;

  name: string;
  orig_name: string;
  path: string;
  full_path: string;
  url: string;
  size: number;

  type?: IUploadType;
  mime: string;
  metadata?: {
    id3title?: string;
    id3artist?: string;
    title?: string;

    duration?: number;
    width?: number;
    height?: number;
    dominant_color?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface IBlockText {
  type: "text";
  text: string;
}

export interface IBlockEmbed {
  type: "video";
  url: string;
}

export type IBlock = IBlockText | IBlockEmbed;
export type FlowDisplayVariant =
  | "single"
  | "vertical"
  | "horizontal"
  | "quadro";
export interface FlowDisplay {
  display: FlowDisplayVariant;
  show_description: boolean;
  dominant_color?: string;
}

export type INodeUser = Partial<IUser>;

export interface INode {
  id?: number;
  user?: INodeUser;

  title: string;
  files: IFile[];

  cover?: IFile;
  type?: string;

  blocks: IBlock[];
  thumbnail?: string;
  description?: string;
  is_liked?: boolean;
  is_heroic?: boolean;
  is_promoted?: boolean;
  is_public?: boolean;
  like_count?: number;

  flow: FlowDisplay;

  tags: ITag[];

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  commented_at?: string;
}

export type IFlowNode = Pick<
  INode,
  "id" | "flow" | "description" | "title" | "thumbnail" | "created_at"
>;

export interface IComment {
  id: number;
  text: string;
  files: IFile[];
  user?: IUser;

  created_at?: string;
  update_at?: string;
  deleted_at?: string;
}

export type IMessage = Omit<IComment, "user" | "node"> & {
  from: IUser;
  to: IUser;
};

export interface ICommentGroup {
  user: IUser;
  comments: IComment[];
  distancesInDays: number[];
  ids: IComment["id"][];
  hasNew: boolean;
}

export type IUploadProgressHandler = (progress: ProgressEvent) => void;
export type IError = ValueOf<typeof ERRORS>;

export const NOTIFICATION_TYPES = {
  message: "message",
  comment: "comment",
  node: "node",
};

export type IMessageNotification = {
  type: typeof NOTIFICATION_TYPES["message"];
  content: Partial<IMessage>;
  created_at: string;
};

export type ICommentNotification = {
  type: typeof NOTIFICATION_TYPES["comment"];
  content: Partial<IComment>;
  created_at: string;
};

export type INotification = IMessageNotification | ICommentNotification;
