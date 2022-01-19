import React, { FC } from 'react';

import { values } from 'ramda';

import { ImageGrid } from '~/components/editors/ImageGrid';
import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';

import styles from './styles.module.scss';

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
