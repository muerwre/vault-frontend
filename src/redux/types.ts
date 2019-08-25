import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { DIALOGS } from '~/redux/modal/constants';
import { ERRORS } from '~/constants/errors';

export interface ITag {
  title: string;
  feature?: 'red' | 'blue' | 'green' | 'olive' | 'black';
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

export type IUploadType = 'image' | 'text' | 'audio' | 'video' | 'other';

export interface IFile {
  id?: UUID;
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

  createdAt?: string;
  updatedAt?: string;
}

export interface IFileWithUUID {
  temp_id?: UUID;
  file: File;
  subject?: string;
  target: string;
  type: string;
}

export interface IBlock {
  type: 'image' | 'text' | 'media' | 'youtube' | 'video';
  files: UUID[];
  content: string;
  embeds: string[];
}

export interface INode {
  id?: number;
  user_id: UUID;

  title: string;
  files: IFile[];

  cover: IFile;
  type: string;

  blocks: IBlock[];

  brief?: {
    thumbnail?: string;
    description?: string;
    owner?: string;
    comments?: number;
  };

  options: {
    flow: {
      display: 'single' | 'double' | 'quadro';
      show_description: boolean;
    };
  };

  createdAt?: string;
  updatedAt?: string;
}

export type IUploadProgressHandler = (progress: ProgressEvent) => void;
export type IError = ValueOf<typeof ERRORS>;
export type IValidationErrors = Record<string, IError>;
