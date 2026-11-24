import { FC } from 'react';

import { EighthNotesIcon } from 'lucide-react';

import { UploadButton } from '~/components/upload/UploadButton';
import { UploadType } from '~/constants/uploads';
import { IEditorComponentProps } from '~/types/node';

type Props = IEditorComponentProps & {};

const UploadAudioButton: FC<Props> = () => (
  <UploadButton
    accept="audio/*"
    icon={<EighthNotesIcon size={24} />}
    type={UploadType.Audio}
    label="Добавить аудио"
  />
);

export { UploadAudioButton };
