import { FC } from 'react';

import { UploadAudioGrid } from '~/components/upload/UploadAudioGrid';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadImageGrid } from '~/components/upload/UploadImageGrid';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import styles from './styles.module.scss';

const AudioEditor: FC<NodeEditorProps> = () => {
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
        <UploadImageGrid
          files={filesImages}
          setFiles={setImages}
          locked={pendingImages}
        />

        <UploadAudioGrid
          files={filesAudios}
          setFiles={setAudios}
          locked={pendingAudios}
        />
      </div>
    </UploadDropzone>
  );
};

export { AudioEditor };
