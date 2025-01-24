import { FC } from 'react';

import { NODE_TYPES } from '~/constants/node';
import { INode } from '~/types';
import { NodeEditorProps } from '~/types/node';

import { AudioEditor } from '../components/AudioEditor';
import { ImageEditor } from '../components/ImageEditor';
import { RoomEditor } from '../components/RoomEditor';
import { TextEditor } from '../components/TextEditor';
import { VideoEditor } from '../components/VideoEditor';

export const NODE_EDITORS: Record<
  (typeof NODE_TYPES)[keyof typeof NODE_TYPES],
  FC<NodeEditorProps>
> = {
  [NODE_TYPES.IMAGE]: ImageEditor,
  [NODE_TYPES.TEXT]: TextEditor,
  [NODE_TYPES.VIDEO]: VideoEditor,
  [NODE_TYPES.AUDIO]: AudioEditor,
  [NODE_TYPES.ROOM]: RoomEditor,
};

export const NODE_EDITOR_DATA: Record<
  (typeof NODE_TYPES)[keyof typeof NODE_TYPES],
  Partial<INode>
> = {
  [NODE_TYPES.TEXT]: {
    blocks: [{ text: '', type: 'text' }],
  },
};
