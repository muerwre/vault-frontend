import React, { FC } from 'react';

import { EditorUploadButton } from '~/components/editors/EditorUploadButton';
import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

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
