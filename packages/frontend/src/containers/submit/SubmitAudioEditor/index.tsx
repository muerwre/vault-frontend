import { FC } from 'react';

import { UploadAudioGrid } from '~/components/upload/UploadAudioGrid';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadImageGrid } from '~/components/upload/UploadImageGrid';
import { UploadType } from '~/constants/uploads';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import { SubmitEmptyState } from '../SubmitEmptyState';
import { SubmitPickButton } from '../SubmitPickButton';
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

  // With no photos yet, a lone square tile looks lost over the song list, so
  // photos start as a button beside the song one.
  const hasImages = filesImages.length > 0 || pendingImages.length > 0;

  // before anything is added, the zone is just buttons to pick files
  if (!hasImages && !filesAudios.length && !pendingAudios.length) {
    return (
      <UploadDropzone onUpload={uploadFiles} className={styles.fill}>
        <SubmitEmptyState
          title="Давайте начнём!"
          hint="Добавьте первую песню"
          vertical
        >
          <SubmitPickButton
            type={UploadType.Audio}
            iconLeft="audio"
            label="Добавить песню"
          />
          <SubmitPickButton
            type={UploadType.Image}
            iconLeft="photo_add"
            label="Добавить обложку"
            color="gray"
          />
        </SubmitEmptyState>
      </UploadDropzone>
    );
  }

  return (
    <UploadDropzone onUpload={uploadFiles}>
      <div className={styles.wrap}>
        {hasImages && (
          <UploadImageGrid
            files={filesImages}
            setFiles={setImages}
            locked={pendingImages}
            compact
            trailing={
              <SubmitUploadCard
                type={UploadType.Image}
                icon="photo_add"
                label="Обложка"
                variant="tile"
              />
            }
          />
        )}

        <UploadAudioGrid
          outlined
          files={filesAudios}
          setFiles={setAudios}
          locked={pendingAudios}
          trailing={
            <div className={styles.pick}>
              <SubmitPickButton
                type={UploadType.Audio}
                iconLeft="audio"
                label="Добавить песню"
              />

              {/* until there is a cover grid with its own add tile */}
              {!hasImages && (
                <SubmitPickButton
                  type={UploadType.Image}
                  iconLeft="photo_add"
                  label="Добавить обложку"
                  color="gray"
                />
              )}
            </div>
          }
        />
      </div>
    </UploadDropzone>
  );
};

export { SubmitAudioEditor };
