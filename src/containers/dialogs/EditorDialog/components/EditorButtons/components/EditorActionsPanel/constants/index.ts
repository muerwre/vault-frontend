import { FC } from 'react';

import { NODE_TYPES } from '~/constants/node';
import { IEditorComponentProps } from '~/types/node';

import { EditorAudioUploadButton } from '../components/EditorAudioUploadButton';
import { EditorFiller } from '../components/EditorFiller';
import { EditorImageUploadButton } from '../components/EditorImageUploadButton';
import { EditorPublicSwitch } from '../components/EditorPublicSwitch';
import { EditorUploadCoverButton } from '../components/EditorUploadCoverButton';

export const NODE_PANEL_COMPONENTS: Record<
  string,
  FC<IEditorComponentProps>[]
> = {
  [NODE_TYPES.TEXT]: [
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
  ],
  [NODE_TYPES.VIDEO]: [
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
  ],
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
  [NODE_TYPES.ROOM]: [
    EditorAudioUploadButton,
    EditorImageUploadButton,
    EditorFiller,
  ],
};
