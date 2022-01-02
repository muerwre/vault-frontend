import React, { FC, useCallback, useMemo } from 'react';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { ImageGrid } from '../ImageGrid';
import { AudioGrid } from '../AudioGrid';
import styles from './styles.module.scss';
import { NodeEditorProps } from '~/types/node';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { useNodeAudios } from '~/hooks/node/useNodeAudios';
import { useNodeFormContext } from '~/hooks/node/useNodeFormFormik';
import { useFileUploaderContext } from '~/hooks/data/useFileUploader';
import { UploadDropzone } from '~/components/upload/UploadDropzone';

type IProps = NodeEditorProps;

const AudioEditor: FC<IProps> = () => {
  const { values } = useNodeFormContext();
  const { pending, setFiles, uploadFiles } = useFileUploaderContext()!;

  const images = useNodeImages(values);
  const audios = useNodeAudios(values);

  const pendingImages = useMemo(() => pending.filter(item => item.type === UPLOAD_TYPES.IMAGE), [
    pending,
  ]);

  const pendingAudios = useMemo(() => pending.filter(item => item.type === UPLOAD_TYPES.AUDIO), [
    pending,
  ]);

  const setImages = useCallback(values => setFiles([...values, ...audios]), [setFiles, audios]);

  const setAudios = useCallback(values => setFiles([...values, ...images]), [setFiles, images]);

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid files={images} setFiles={setImages} locked={pendingImages} />
        <AudioGrid files={audios} setFiles={setAudios} locked={pendingAudios} />
      </div>
    </UploadDropzone>
  );
};

export { AudioEditor };
