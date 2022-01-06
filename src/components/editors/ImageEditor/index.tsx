import React, { FC } from 'react';
import { ImageGrid } from '~/components/editors/ImageGrid';
import styles from './styles.module.scss';
import { NodeEditorProps } from '~/types/node';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from 'ramda';

type IProps = NodeEditorProps;

const ImageEditor: FC<IProps> = () => {
  const { pending, files, setFiles, uploadFiles } = useUploaderContext()!;

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid files={files} setFiles={setFiles} locked={values(pending)} />
      </div>
    </UploadDropzone>
  );
};

export { ImageEditor };
