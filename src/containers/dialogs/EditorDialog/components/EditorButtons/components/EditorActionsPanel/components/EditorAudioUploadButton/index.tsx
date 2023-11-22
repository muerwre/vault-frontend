import { FC } from 'react';

import { UploadType } from '~/constants/uploads';
import { EditorUploadButton } from '~/containers/dialogs/EditorDialog/components/EditorButtons/components/EditorActionsPanel/components/EditorUploadButton';
import { IEditorComponentProps } from '~/types/node';

type Props = IEditorComponentProps & {};

const EditorAudioUploadButton: FC<Props> = () => (
  <EditorUploadButton
    accept="audio/*"
    icon="audio"
    type={UploadType.Audio}
    label="Добавить аудио"
  />
);

export { EditorAudioUploadButton };
