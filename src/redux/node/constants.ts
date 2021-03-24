import { FC } from 'react';
import { IComment, INode, ValueOf } from '../types';
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
import { IEditorComponentProps, NodeEditorProps } from '~/redux/node/types';
import { EditorFiller } from '~/components/editors/EditorFiller';
import { EditorPublicSwitch } from '~/components/editors/EditorPublicSwitch';
import { NodeImageSwiperBlock } from '~/components/node/NodeImageSwiperBlock';
import { LabNodeTitle } from '~/components/lab/LabNodeTitle';
import { LabText } from '~/components/lab/LabText';
import { LabImage } from '~/components/lab/LabImage';
import { LabBottomPanel } from '~/components/lab/LabBottomPanel';
import { LabPad } from '~/components/lab/LabPad';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
  SAVE: `${prefix}SAVE`,
  LOAD_NODE: `${prefix}LOAD_NODE`,
  GOTO_NODE: `${prefix}GOTO_NODE`,
  SET: `${prefix}SET`,

  EDIT: `${prefix}EDIT`,
  LIKE: `${prefix}LIKE`,
  STAR: `${prefix}STAR`,
  LOCK: `${prefix}LOCK`,
  LOCK_COMMENT: `${prefix}LOCK_COMMENT`,
  EDIT_COMMENT: `${prefix}EDIT_COMMENT`,
  CREATE: `${prefix}CREATE`,
  LOAD_MORE_COMMENTS: `${prefix}LOAD_MORE_COMMENTS`,

  SET_SAVE_ERRORS: `${prefix}SET_SAVE_ERRORS`,
  SET_LOADING: `${prefix}SET_LOADING`,
  SET_LOADING_COMMENTS: `${prefix}SET_LOADING_COMMENTS`,
  SET_SENDING_COMMENT: `${prefix}SET_SENDING_COMMENT`,
  SET_CURRENT: `${prefix}SET_CURRENT`,
  SET_COMMENT_DATA: `${prefix}SET_COMMENT_DATA`,
  SET_EDITOR: `${prefix}SET_EDITOR`,

  POST_COMMENT: `${prefix}POST_LOCAL_COMMENT`,
  SET_COMMENTS: `${prefix}SET_COMMENTS`,
  SET_RELATED: `${prefix}SET_RELATED`,

  UPDATE_TAGS: `${prefix}UPDATE_TAGS`,
  SET_TAGS: `${prefix}SET_TAGS`,
  SET_COVER_IMAGE: `${prefix}SET_COVER_IMAGE`,
};

export const EMPTY_NODE: INode = {
  id: 0,
  user: undefined,
  title: '',
  files: [],

  cover: undefined,
  type: undefined,

  blocks: [],
  tags: [],
  is_public: true,
  is_promoted: true,

  flow: {
    display: 'single',
    show_description: false,
  },
};

export const NODE_TYPES = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  TEXT: 'text',
};

export type INodeComponentProps = {
  node: INode;
  isLoading: boolean;
};

export type INodeComponents = Record<ValueOf<typeof NODE_TYPES>, FC<INodeComponentProps>>;

export const LAB_PREVIEW_LAYOUT: Record<string, FC<INodeComponentProps>[]> = {
  [NODE_TYPES.IMAGE]: [LabImage, LabPad, LabNodeTitle],
  [NODE_TYPES.VIDEO]: [NodeVideoBlock, LabPad, LabNodeTitle],
  [NODE_TYPES.AUDIO]: [LabPad, LabNodeTitle, LabPad, NodeAudioImageBlock, NodeAudioBlock, LabPad],
  [NODE_TYPES.TEXT]: [LabPad, LabNodeTitle, LabPad, LabText, LabPad],
};

export const NODE_HEADS: INodeComponents = {
  [NODE_TYPES.IMAGE]: NodeImageSwiperBlock,
};

export const NODE_COMPONENTS: INodeComponents = {
  [NODE_TYPES.VIDEO]: NodeVideoBlock,
  [NODE_TYPES.AUDIO]: NodeAudioImageBlock,
};

export const NODE_INLINES: INodeComponents = {
  [NODE_TYPES.TEXT]: NodeTextBlock,
  [NODE_TYPES.AUDIO]: NodeAudioBlock,
};

export const EMPTY_COMMENT: IComment = {
  id: 0,
  text: '',
  files: [],
  user: undefined,
};

export const NODE_EDITORS: Record<
  typeof NODE_TYPES[keyof typeof NODE_TYPES],
  FC<NodeEditorProps>
> = {
  [NODE_TYPES.IMAGE]: ImageEditor,
  [NODE_TYPES.TEXT]: TextEditor,
  [NODE_TYPES.VIDEO]: VideoEditor,
  [NODE_TYPES.AUDIO]: AudioEditor,
};

export const NODE_PANEL_COMPONENTS: Record<string, FC<IEditorComponentProps>[]> = {
  [NODE_TYPES.TEXT]: [EditorFiller, EditorUploadCoverButton, EditorPublicSwitch],
  [NODE_TYPES.VIDEO]: [EditorFiller, EditorUploadCoverButton, EditorPublicSwitch],
  [NODE_TYPES.IMAGE]: [
    EditorImageUploadButton,
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
  ],
  [NODE_TYPES.AUDIO]: [
    EditorAudioUploadButton,
    EditorImageUploadButton,
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
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

export const COMMENTS_DISPLAY = 25;
