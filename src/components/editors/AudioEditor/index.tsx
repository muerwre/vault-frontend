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

const mapStateToProps = selectUploads;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & NodeEditorProps;

const AudioEditorUnconnected: FC<IProps> = ({ data, setData, temp, statuses }) => {
  const images = useNodeImages(data);

  const pending_images = useMemo(
    () =>
      temp
        .filter(id => !!statuses[id] && statuses[id].type === UPLOAD_TYPES.IMAGE)
        .map(id => statuses[id]),
    [temp, statuses]
  );

  const audios = useNodeAudios(data);

  const pending_audios = useMemo(
    () =>
      temp
        .filter(id => !!statuses[id] && statuses[id].type === UPLOAD_TYPES.AUDIO)
        .map(id => statuses[id]),
    [temp, statuses]
  );

  const setImages = useCallback(files => setData({ ...data, files: [...files, ...audios] }), [
    setData,
    data,
    audios,
  ]);

  const setAudios = useCallback(files => setData({ ...data, files: [...files, ...images] }), [
    setData,
    data,
    images,
  ]);

  return (
    <div className={styles.wrap}>
      <ImageGrid files={images} setFiles={setImages} locked={pending_images} />
      <AudioGrid files={audios} setFiles={setAudios} locked={pending_audios} />
    </div>
  );
};

const AudioEditor = connect(mapStateToProps, mapDispatchToProps)(AudioEditorUnconnected);

export { AudioEditor };
