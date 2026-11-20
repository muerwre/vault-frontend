import { FC } from 'react';

import { UploadButton } from '~/components/upload/UploadButton';
import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

type Props = IEditorComponentProps & {};

const UploadImageButton: FC<Props> = () => (
  <UploadButton
    accept="image/*"
    icon="image"
    type={UploadType.Image}
    label="Добавить фоточек"
  />
);

export { UploadImageButton };
