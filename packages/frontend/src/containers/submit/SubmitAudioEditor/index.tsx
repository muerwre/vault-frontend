import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadType } from '~/constants/uploads';
import { AudioGrid } from '~/containers/dialogs/EditorDialog/components/AudioGrid';
import { ImageGrid } from '~/containers/dialogs/EditorDialog/components/ImageGrid';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import { SubmitUploadCard } from '../SubmitUploadCard';

import styles from './styles.module.scss';

/** Song node content: cover photos and the track list, each ending in an add card. */
const SubmitAudioEditor: FC<NodeEditorProps> = () => {
  const {
    filesImages,
    filesAudios,
    uploadFiles,
    setImages,
    setAudios,
    pendingAudios,
    pendingImages,
  } = useUploaderContext()!;

  // With no photos yet, a lone square tile looks lost next to the song
  // list, so the photo card starts as a row like the song one.
  const hasImages = filesImages.length > 0 || pendingImages.length > 0;

  return (
    <UploadDropzone onUpload={uploadFiles}>
      <div className={styles.wrap}>
        {hasImages ? (
          <ImageGrid
            files={filesImages}
            setFiles={setImages}
            locked={pendingImages}
            trailing={
              <SubmitUploadCard
                type={UploadType.Image}
                icon="photo_add"
                label="Обложка"
                variant="tile"
              />
            }
          />
        ) : (
          <SubmitUploadCard
            type={UploadType.Image}
            icon="photo_add"
            label="Добавить обложку"
            variant="row"
          />
        )}

        <AudioGrid
          files={filesAudios}
          setFiles={setAudios}
          locked={pendingAudios}
          trailing={
            <SubmitUploadCard
              type={UploadType.Audio}
              icon="audio"
              label="Добавить песню"
              variant="row"
            />
          }
        />
      </div>
    </UploadDropzone>
  );
};

export { SubmitAudioEditor };
