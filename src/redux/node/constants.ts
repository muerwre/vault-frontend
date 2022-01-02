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
import { LabPad } from '~/components/lab/LabPad';
import { LabDescription } from '~/components/lab/LabDescription';
import { LabVideo } from '~/components/lab/LabVideo';
import { LabAudio } from '~/components/lab/LabAudioBlock';

const prefix = 'NODE.';
export const NODE_ACTIONS = {
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
  [NODE_TYPES.IMAGE]: [LabImage, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.VIDEO]: [LabVideo, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.AUDIO]: [LabPad, LabNodeTitle, LabPad, NodeAudioImageBlock, LabAudio, LabPad],
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
