import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/types/node';

type IProps = IEditorComponentProps & {};

const EditorAudioUploadButton: FC<IProps> = () => (
  <EditorUploadButton
    accept="audio/*"
    icon="audio"
    type={UPLOAD_TYPES.AUDIO}
    label="Добавить аудио"
  />
);

export { EditorAudioUploadButton };
