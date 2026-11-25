import { FC, ReactNode } from 'react';

import { NODE_TYPES, NodeComponentProps } from '~/constants/node';

import { LabAudio } from '../components/LabAudioBlock';
import { LabDescription } from '../components/LabDescription';
import { LabImage } from '../components/LabImage';
import { LabNodeTitle } from '../components/LabNodeTitle';
import { LabPad } from '../components/LabPad';
import { LabText } from '../components/LabText';
import { LabVideo } from '../components/LabVideo';

export type LabBlockProps = NodeComponentProps & {
  /** Shown by the title in place of the heroic star, when given. */
  titleIcon?: ReactNode;
};

export const LAB_PREVIEW_LAYOUT: Record<string, FC<LabBlockProps>[]> = {
  [NODE_TYPES.IMAGE]: [LabImage, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.VIDEO]: [LabVideo, LabPad, LabNodeTitle, LabDescription],
  [NODE_TYPES.AUDIO]: [LabPad, LabNodeTitle, LabPad, LabAudio, LabPad],
  [NODE_TYPES.TEXT]: [LabPad, LabNodeTitle, LabPad, LabText, LabPad],
};
