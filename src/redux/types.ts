import { DetailedHTMLProps, InputHTMLAttributes } from 'react';
import { DIALOGS } from '~/redux/modal/constants';

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

export interface IFile {
  id?: UUID;
  temp_id?: UUID;
  user_id?: UUID;
  node_id?: UUID;

  name: string;
  path: string;
  full_path: string;
  size: number;

  type: 'image' | 'text' | 'audio' | 'video';
  mime: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface IFileWithUUID {
  temp_id?: UUID;
  file: File;
  subject: string;
}

export interface IBlock {
  type: 'image' | 'text' | 'media' | 'youtube' | 'video',
  temp_ids: UUID[];
  attaches: UUID[];
}

export interface INode {
  id?: UUID;
  user_id: UUID;

  title: string;
  files: IFile[];

  cover: IFile['id'];
  type: 'image';

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
    }
  };

  createdAt?: string;
  updatedAt?: string;
}
