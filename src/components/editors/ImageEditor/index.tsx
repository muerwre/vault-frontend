import React, { FC } from 'react';
import { ImageGrid } from '~/components/editors/ImageGrid';
import styles from './styles.module.scss';
import { NodeEditorProps } from '~/redux/node/types';
import { useFileUploaderContext } from '~/hooks/data/useFileUploader';
import { UploadDropzone } from '~/components/upload/UploadDropzone';

type IProps = NodeEditorProps;

const ImageEditor: FC<IProps> = () => {
  const { pending, files, setFiles, uploadFiles } = useFileUploaderContext()!;

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid files={files} setFiles={setFiles} locked={pending} />
      </div>
    </UploadDropzone>
  );
};

export { ImageEditor };
