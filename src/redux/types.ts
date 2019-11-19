import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { DIALOGS } from "~/redux/modal/constants";
import { ERRORS } from "~/constants/errors";
import { IUser } from "./auth/types";

export interface ITag {
  id: number;
  title: string;

  data: Record<string, string>;
  user: IUser;
  nodes: INode[];

  readonly created_at: string;
  readonly updated_at: string;
}

export type IInputTextProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  wrapperClassName?: string;
  handler?: (value: string) => void;
  required?: boolean;
  title?: string;
  error?: string;
  can_negative?: boolean;
  status?: string;
  maskChar?: string;
  mask?: string;
  onRef?: (ref: any) => void;
  is_loading?: boolean;
};

export type IIcon = string;

export type ValueOf<T> = T[keyof T];

export interface IDialogProps {
  onRequestClose: () => void;
  onDialogChange: (dialog: ValueOf<typeof DIALOGS>) => void;
}

export interface IApiErrorResult {
  detail?: string;
  code?: string;
}

export interface IResultWithStatus<T> {
  status: any;
  data?: Partial<T> & IApiErrorResult;
  error?: string;
  debug?: string;
}

export type UUID = string;

export type IUploadType = "image" | "text" | "audio" | "video" | "other";

export interface IFile {
  id?: number;
  temp_id?: UUID;
  user_id?: UUID;
  node_id?: UUID;

  name: string;
  path: string;
  full_path: string;
  url: string;
  size: number;

  type: IUploadType;
  mime: string;
  metadata?: {
    id3title?: string;
    id3artist?: string;
    title?: string;

    duration?: number;
    width?: number;
    height?: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface IFileWithUUID {
  temp_id?: UUID;
  file: File;
  subject?: string;
  target: string;
  type: string;
  onSuccess?: (file: IFile) => void;
  onFail?: () => void;
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

export interface INode {
  id?: number;
  user: Partial<IUser>;

  title: string;
  files: IFile[];

  cover: IFile;
  type: string;

  blocks: IBlock[];
  thumbnail?: string;
  description?: string;
  is_liked?: boolean;
  is_heroic?: boolean;

  flow: {
    display: "single" | "vertical" | "horizontal" | "quadro";
    show_description: boolean;
  };

  tags: ITag[];

  created_at?: string;
  updated_at?: string;
  commented_at?: string;
}

export interface IComment {
  id: number;
  text: string;
  temp_ids?: string[];
  files: IFile[];
  is_private: boolean;
  user: IUser;

  created_at?: string;
  update_at?: string;
}

export type IMessage = Omit<IComment, "user" | "node"> & {
  from: IUser;
  to: IUser;
};

export interface ICommentGroup {
  user: IUser;
  comments: IComment[];
  ids: IComment["id"][];
}

export type IUploadProgressHandler = (progress: ProgressEvent) => void;
export type IError = ValueOf<typeof ERRORS>;
export type IValidationErrors = Record<string, IError>;
export type InputHandler<T = string> = (val: T) => void;

export const NOTIFICATION_TYPES = {
  message: "message",
  comment: "comment",
  node: "node"
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

export type INodeNotification = {
  type: typeof NOTIFICATION_TYPES["node"];
  content: Partial<INode>;
  created_at: string;
};

export type INotification = IMessageNotification | ICommentNotification;
