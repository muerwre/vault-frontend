import React, { FC, useCallback, useMemo } from 'react';
import { INode } from '~/redux/types';
import { connect } from 'react-redux';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { ImageGrid } from '../ImageGrid';
import { AudioGrid } from '../AudioGrid';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import * as styles from './styles.scss';

const mapStateToProps = selectUploads;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    data: INode;
    setData: (val: INode) => void;
    temp: string[];
    setTemp: (val: string[]) => void;
  };

const AudioEditorUnconnected: FC<IProps> = ({ data, setData, temp, statuses }) => {
  const images = useMemo(
    () => data.files.filter(file => file && file.type === UPLOAD_TYPES.IMAGE),
    [data.files]
  );

  const pending_images = useMemo(
    () =>
      temp
        .filter(id => !!statuses[id] && statuses[id].type === UPLOAD_TYPES.IMAGE)
        .map(id => statuses[id]),
    [temp, statuses]
  );

  const audios = useMemo(
    () => data.files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO),
    [data.files]
  );

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

const AudioEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioEditorUnconnected);

export { AudioEditor };
