import { FC } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from '~/utils/ramda';

import { ImageGrid } from '../ImageGrid';

import styles from './styles.module.scss';

type Props = NodeEditorProps;

const ImageEditor: FC<Props> = () => {
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
