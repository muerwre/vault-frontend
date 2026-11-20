import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadImageGrid } from '~/components/upload/UploadImageGrid';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from '~/utils/ramda';

import styles from './styles.module.scss';

type Props = NodeEditorProps;

const ImageEditor: FC<Props> = () => {
  const { pending, files, setFiles, uploadFiles } = useUploaderContext()!;

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <UploadImageGrid
          files={files}
          setFiles={setFiles}
          locked={values(pending)}
        />
      </div>
    </UploadDropzone>
  );
};

export { ImageEditor };
