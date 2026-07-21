import { FC } from 'react';

import { NodeAudioBlock } from '~/components/node/NodeAudioBlock';
import { NodeAudioImageBlock } from '~/components/node/NodeAudioImageBlock';
import { NodeImageSwiperBlock } from '~/components/node/NodeImageSwiperBlock';
import { NodeTextBlock } from '~/components/node/NodeTextBlock';
import { NodeVideoBlock } from '~/components/node/NodeVideoBlock';
import { IComment, INode, ValueOf } from '~/types';

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
  ROOM: 'room',
};

export type NodeComponentProps = {
  node: INode;
  isLoading: boolean;
};

export type INodeComponents = Record<
  ValueOf<typeof NODE_TYPES>,
  FC<NodeComponentProps>
>;

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

export const NODE_SETTINGS = {
  MAX_FILES: 16,
  MAX_IMAGE_ASPECT: 1.2,
};

export const DEFAULT_DOMINANT_COLOR = '#000000';

export const COMMENTS_DISPLAY = 25;
