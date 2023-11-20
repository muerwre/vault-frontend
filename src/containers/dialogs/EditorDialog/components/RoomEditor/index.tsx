import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import { AudioGrid } from '../AudioGrid';
import { ImageGrid } from '../ImageGrid';

import styles from './styles.module.scss';

const RoomEditor: FC<NodeEditorProps> = () => {
  const {
    filesImages,
    filesAudios,
    uploadFiles,
    setImages,
    setAudios,
    pendingAudios,
    pendingImages,
  } = useUploaderContext()!;

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid
          files={filesImages}
          setFiles={setImages}
          locked={pendingImages}
        />

        <AudioGrid
          files={filesAudios}
          setFiles={setAudios}
          locked={pendingAudios}
        />
      </div>
    </UploadDropzone>
  );
};

export { RoomEditor };
