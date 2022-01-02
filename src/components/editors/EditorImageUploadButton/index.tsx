import React, { FC } from 'react';
import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { IEditorComponentProps } from '~/types/node';

type IProps = IEditorComponentProps & {};

const EditorImageUploadButton: FC<IProps> = () => (
  <EditorUploadButton
    accept="image/*"
    icon="image"
    type={UPLOAD_TYPES.IMAGE}
    label="Добавить фоточек"
  />
);

export { EditorImageUploadButton };
