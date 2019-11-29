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
  GOTO_NODE: `${prefix}GOTO_NODE`,

  EDIT: `${prefix}EDIT`,
  LIKE: `${prefix}LIKE`,
  STAR: `${prefix}STAR`,
  LOCK: `${prefix}LOCK`,
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
  SET_RELATED: `${prefix}SET_RELATED`,

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

  /*
  files: [
    {
      name: 'screenshot_2019-09-29_21-13-38_502253296-1572589001092.png',
      path: 'uploads/2019/10/image/',
      full_path:
        'public/uploads/2019/10/image/screenshot_2019-09-29_21-13-38_502253296-1572589001092.png',
      url:
        'REMOTE_CURRENT://uploads/2019/10/image/screenshot_2019-09-29_21-13-38_502253296-1572589001092.png',
      size: 994331,
      type: 'image',
      mime: 'image/png',
      metadata: {
        width: 1919,
        height: 1079,
      },
      id: 8709,
    },
    {
      name: 'screenshot_2019-09-29_19-05-41_148603009-1572589001080.png',
      path: 'uploads/2019/10/image/',
      full_path:
        'public/uploads/2019/10/image/screenshot_2019-09-29_19-05-41_148603009-1572589001080.png',
      url:
        'REMOTE_CURRENT://uploads/2019/10/image/screenshot_2019-09-29_19-05-41_148603009-1572589001080.png',
      size: 2145,
      type: 'image',
      mime: 'image/png',
      metadata: {
        width: 445,
        height: 446,
      },
      id: 8708,
    },
    {
      name: 'screenshot_2019-09-29_21-13-26_924738012-1572589001110.png',
      path: 'uploads/2019/10/image/',
      full_path:
        'public/uploads/2019/10/image/screenshot_2019-09-29_21-13-26_924738012-1572589001110.png',
      url:
        'REMOTE_CURRENT://uploads/2019/10/image/screenshot_2019-09-29_21-13-26_924738012-1572589001110.png',
      size: 881224,
      type: 'image',
      mime: 'image/png',
      metadata: {
        width: 1919,
        height: 1079,
      },
      id: 8710,
    },
    {
      name:
        'Advent_Chamber_Orchestra_-_05_-_Dvorak_-_Serenade_for_Strings_Op22_in_E_Major_larghetto-1572597841834.mp3',
      path: 'uploads/2019/10/audio/',
      full_path:
        'public/uploads/2019/10/audio/Advent_Chamber_Orchestra_-_05_-_Dvorak_-_Serenade_for_Strings_Op22_in_E_Major_larghetto-1572597841834.mp3',
      url:
        'REMOTE_CURRENT://uploads/2019/10/audio/Advent_Chamber_Orchestra_-_05_-_Dvorak_-_Serenade_for_Strings_Op22_in_E_Major_larghetto-1572597841834.mp3',
      size: 11155009,
      type: 'audio',
      mime: 'audio/mp3',
      metadata: {
        duration: 343.3795918367347,
        id3title: 'Dvorak - Serenade for Strings Op22 in E Major larghetto',
        id3artist: 'Advent Chamber Orchestra',
      },
      id: 8714,
    },
    {
      name: '182a0d234aef882a58f240c5c0812bb2cad9506a875ca4c7c07d8f9f077ebb00-1572597841829.mp3',
      path: 'uploads/2019/10/audio/',
      full_path:
        'public/uploads/2019/10/audio/182a0d234aef882a58f240c5c0812bb2cad9506a875ca4c7c07d8f9f077ebb00-1572597841829.mp3',
      url:
        'REMOTE_CURRENT://uploads/2019/10/audio/182a0d234aef882a58f240c5c0812bb2cad9506a875ca4c7c07d8f9f077ebb00-1572597841829.mp3',
      size: 6038673,
      type: 'audio',
      mime: 'audio/mp3',
      metadata: {
        duration: 251.58530612244897,
        id3title: null,
        id3artist: null,
      },
      id: 8713,
    },
  ],
  */
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
