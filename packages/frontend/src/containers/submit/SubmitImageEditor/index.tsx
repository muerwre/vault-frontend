import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadType } from '~/constants/uploads';
import { ImageGrid } from '~/containers/dialogs/EditorDialog/components/ImageGrid';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from '~/utils/ramda';

import { SubmitEmptyState } from '../SubmitEmptyState';
import { SubmitPickButton } from '../SubmitPickButton';
import { SubmitUploadCard } from '../SubmitUploadCard';

import styles from './styles.module.scss';

/** Photo node content: the photo grid, ending in a card that adds more. */
const SubmitImageEditor: FC<NodeEditorProps> = () => {
  const { pending, files, setFiles, uploadFiles } = useUploaderContext()!;

  // before the first photo, the zone is just a button to pick some
  if (!files.length && !values(pending).length) {
    return (
      <UploadDropzone onUpload={uploadFiles} className={styles.fill}>
        <SubmitEmptyState
          title="Давайте начнём!"
          hint="Добавьте своё первое фото"
        >
          <SubmitPickButton
            type={UploadType.Image}
            iconLeft="photo_add"
            label="Добавить фото"
          />
        </SubmitEmptyState>
      </UploadDropzone>
    );
  }

  return (
    <UploadDropzone onUpload={uploadFiles}>
      <ImageGrid
        files={files}
        setFiles={setFiles}
        locked={values(pending)}
        trailing={
          <SubmitUploadCard
            type={UploadType.Image}
            icon="photo_add"
            label="Добавить"
            variant="tile"
          />
        }
      />
    </UploadDropzone>
  );
};

export { SubmitImageEditor };
