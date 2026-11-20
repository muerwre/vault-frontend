import { FC } from 'react';

import { NODE_TYPES, NodeComponentProps } from '~/constants/node';

import { LabAudio } from '../components/LabAudioBlock';
import { LabCover } from '../components/LabCover';
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
    LabCover,
    LabPad,
    LabNodeTitle,
    LabPad,
    LabAudio,
    LabPad,
  ],
  [NODE_TYPES.TEXT]: [LabCover, LabPad, LabNodeTitle, LabPad, LabText, LabPad],
};
