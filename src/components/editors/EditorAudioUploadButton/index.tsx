import React, { FC } from 'react';

import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

type IProps = IEditorComponentProps & {};

const EditorAudioUploadButton: FC<IProps> = () => (
  <EditorUploadButton
    accept="audio/*"
    icon="audio"
    type={UploadType.Audio}
    label="Добавить аудио"
  />
);

export { EditorAudioUploadButton };
