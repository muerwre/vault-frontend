import { FC } from 'react';

import { NodeAudioImageBlock } from '~/components/node/NodeAudioImageBlock';
import { NODE_TYPES, NodeComponentProps } from '~/constants/node';

import { LabAudio } from '../components/LabAudioBlock';
import { LabDescription } from '../components/LabDescription';
import { LabImage } from '../components/LabImage';
import { LabNodeTitle } from '../components/LabNodeTitle';
import { LabPad } from '../components/LabPad';
import { LabText } from '../components/LabText';
import { LabVideo } from '../components/LabVideo';

export const LAB_PREVIEW_LAYOUT: Record<string, FC<NodeComponentProps>[]> = {
  [NODE_TYPES.IMAGE]: [LabImage, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.VIDEO]: [LabVideo, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.AUDIO]: [
    LabPad,
    LabNodeTitle,
    LabPad,
    NodeAudioImageBlock,
    LabAudio,
    LabPad,
  ],
  [NODE_TYPES.TEXT]: [LabPad, LabNodeTitle, LabPad, LabText, LabPad],
};
