import React, { FC, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { ImageGrid } from '../ImageGrid';
import { AudioGrid } from '../AudioGrid';
import { selectUploads } from '~/redux/uploads/selectors';

import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import styles from './styles.module.scss';
import { NodeEditorProps } from '~/redux/node/types';
import { useNodeImages } from '~/utils/hooks/node/useNodeImages';
import { useNodeAudios } from '~/utils/hooks/node/useNodeAudios';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import { useFileUploaderContext } from '~/utils/hooks/fileUploader';

type IProps = NodeEditorProps;

const AudioEditor: FC<IProps> = () => {
  const { values } = useNodeFormContext();
  const { pending, setFiles } = useFileUploaderContext()!;

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
    <div className={styles.wrap}>
      <ImageGrid files={images} setFiles={setImages} locked={pendingImages} />
      <AudioGrid files={audios} setFiles={setAudios} locked={pendingAudios} />
    </div>
  );
};

export { AudioEditor };
