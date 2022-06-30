import React, { FC, useCallback, useMemo } from 'react';

import { UploadDropzone } from '~/components/upload/UploadDropzone';
import { UploadType } from '~/constants/uploads';
import { IFile } from '~/types';
import { NodeEditorProps } from '~/types/node';
import { useUploaderContext } from '~/utils/context/UploaderContextProvider';
import { values } from '~/utils/ramda';

import { AudioGrid } from '../AudioGrid';
import { ImageGrid } from '../ImageGrid';

import styles from './styles.module.scss';

type IProps = NodeEditorProps;

const AudioEditor: FC<IProps> = () => {
  const { pending, filesAudios, filesImages, setFiles, uploadFiles } = useUploaderContext()!;

  const pendingImages = useMemo(
    () => values(pending).filter(item => item.type === UploadType.Image),
    [pending]
  );

  const pendingAudios = useMemo(
    () => values(pending).filter(item => item.type === UploadType.Audio),
    [pending]
  );

  const setImages = useCallback((values: IFile[]) => setFiles([...values, ...filesAudios]), [
    setFiles,
    filesAudios,
  ]);
  const setAudios = useCallback((values: IFile[]) => setFiles([...values, ...filesImages]), [
    setFiles,
    filesImages,
  ]);

  return (
    <UploadDropzone onUpload={uploadFiles} helperClassName={styles.dropzone}>
      <div className={styles.wrap}>
        <ImageGrid files={filesImages} setFiles={setImages} locked={pendingImages} />
        <AudioGrid files={filesAudios} setFiles={setAudios} locked={pendingAudios} />
      </div>
    </UploadDropzone>
  );
};

export { AudioEditor };
