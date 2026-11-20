import { FC } from 'react';

import { UploadAudioButton } from '~/components/upload/UploadAudioButton';
import { UploadImageButton } from '~/components/upload/UploadImageButton';
import { NODE_TYPES } from '~/constants/node';
import { IEditorComponentProps } from '~/types/node';

import { EditorFiller } from '../components/EditorFiller';
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
    UploadImageButton,
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
  ],
  [NODE_TYPES.AUDIO]: [
    UploadAudioButton,
    UploadImageButton,
    EditorFiller,
    EditorUploadCoverButton,
    EditorPublicSwitch,
  ],
  [NODE_TYPES.ROOM]: [UploadAudioButton, UploadImageButton, EditorFiller],
};
