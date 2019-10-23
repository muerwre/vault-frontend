import { FC } from 'react';
import { INode, ValueOf, IComment } from '../types';
import { NodeImageSlideBlock } from '~/components/node/NodeImageSlideBlock';
import { NodeTextBlock } from '~/components/node/NodeTextBlock';
import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';
import { NodeVideoBlock } from '~/components/node/NodeVideoBlock';
import { NodeAudioImageBlock } from '~/components/node/NodeAudioImageBlock';
import { ImageEditor } from '~/components/editors/ImageEditor';
import { TextEditor } from '~/components/editors/TextEditor';
import { VideoEditor } from '~/components/editors/VideoEditor';
import { AudioEditor } from '~/components/editors/AudioEditor';
import { EditorImageUploadButton } from '~/components/editors/EditorImageUploadButton';
import { EditorAudioUploadButton } from '~/components/editors/EditorAudioUploadButton';
import { EditorUploadCoverButton } from '~/components/editors/EditorUploadCoverButton';
import { Filler } from '~/components/containers/Filler';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
  SAVE: `${prefix}SAVE`,
  LOAD_NODE: `${prefix}LOAD_NODE`,

  EDIT: `${prefix}EDIT`,
  LIKE: `${prefix}LIKE`,
  STAR: `${prefix}STAR`,
  CREATE: `${prefix}CREATE`,

  SET_SAVE_ERRORS: `${prefix}SET_SAVE_ERRORS`,
  SET_LOADING: `${prefix}SET_LOADING`,
  SET_LOADING_COMMENTS: `${prefix}SET_LOADING_COMMENTS`,
  SET_SENDING_COMMENT: `${prefix}SET_SENDING_COMMENT`,
  SET_CURRENT: `${prefix}SET_CURRENT`,
  SET_COMMENT_DATA: `${prefix}SET_COMMENT_DATA`,
  SET_EDITOR: `${prefix}SET_EDITOR`,

  POST_COMMENT: `${prefix}POST_COMMENT`,
  SET_COMMENTS: `${prefix}SET_COMMENTS`,

  UPDATE_TAGS: `${prefix}UPDATE_TAGS`,
  SET_TAGS: `${prefix}SET_TAGS`,
  SET_COVER_IMAGE: `${prefix}SET_COVER_IMAGE`,
};

export const EMPTY_NODE: INode = {
  id: null,

  user: null,

  title: '',
  files: [],

  cover: null,
  type: null,

  blocks: [],
  tags: [],

  options: {
    flow: {
      display: 'single',
      show_description: false,
    },
  },
};

export const NODE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text',
};

type INodeComponents = Record<
  ValueOf<typeof NODE_TYPES>,
  FC<{ node: INode; is_loading: boolean; layout: {}; updateLayout: () => void }>
>;

export const NODE_COMPONENTS: INodeComponents = {
  [NODE_TYPES.IMAGE]: NodeImageSlideBlock,
  [NODE_TYPES.VIDEO]: NodeVideoBlock,
  [NODE_TYPES.AUDIO]: NodeAudioImageBlock,
};

export const NODE_INLINES: INodeComponents = {
  [NODE_TYPES.TEXT]: NodeTextBlock,
  [NODE_TYPES.AUDIO]: NodeAudioBlock,
};

export const EMPTY_COMMENT: IComment = {
  id: null,
  text: '',
  files: [],
  temp_ids: [],
  is_private: false,
  user: null,
};

export const NODE_EDITORS = {
  [NODE_TYPES.IMAGE]: ImageEditor,
  [NODE_TYPES.TEXT]: TextEditor,
  [NODE_TYPES.VIDEO]: VideoEditor,
  [NODE_TYPES.AUDIO]: AudioEditor,
};

export const NODE_PANEL_COMPONENTS = {
  [NODE_TYPES.TEXT]: [Filler, EditorUploadCoverButton],
  [NODE_TYPES.VIDEO]: [Filler, EditorUploadCoverButton],
  [NODE_TYPES.IMAGE]: [EditorImageUploadButton, Filler, EditorUploadCoverButton],
  [NODE_TYPES.AUDIO]: [
    EditorAudioUploadButton,
    EditorImageUploadButton,
    Filler,
    EditorUploadCoverButton,
  ],
};

export const NODE_EDITOR_DATA: Record<
  typeof NODE_TYPES[keyof typeof NODE_TYPES],
  Partial<INode>
> = {
  [NODE_TYPES.TEXT]: {
    blocks: [{ text: '', type: 'text' }],
  },
};

export const NODE_SETTINGS = {
  MAX_FILES: 16,
  MAX_IMAGE_ASPECT: 1.2,
};
