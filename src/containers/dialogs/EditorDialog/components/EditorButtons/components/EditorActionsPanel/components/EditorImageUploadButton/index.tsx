import React, { FC } from 'react';

import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

import { EditorUploadButton } from '../EditorUploadButton';

type IProps = IEditorComponentProps & {};

const EditorImageUploadButton: FC<IProps> = () => (
  <EditorUploadButton
    accept="image/*"
    icon="image"
    type={UploadType.Image}
    label="Добавить фоточек"
  />
);

export { EditorImageUploadButton };
