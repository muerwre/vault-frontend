import { FC } from 'react';

import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

import { EditorUploadButton } from '../EditorUploadButton';

type Props = IEditorComponentProps & {};

const EditorImageUploadButton: FC<Props> = () => (
  <EditorUploadButton
    accept="image/*"
    icon="image"
    type={UploadType.Image}
    label="Добавить фоточек"
  />
);

export { EditorImageUploadButton };
