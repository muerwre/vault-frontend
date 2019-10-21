import React, { FC, useCallback, useMemo } from 'react';
import { INode } from '~/redux/types';
import { connect } from 'react-redux';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { ImageGrid } from '../ImageGrid';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';

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

  const pending_images = useMemo(() => temp.filter(id => !!statuses[id]).map(id => statuses[id]), [
    temp,
    statuses,
  ]);

  const audios = useMemo(
    () => data.files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO),
    [data.files]
  );

  const setImages = useCallback(files => setData({ ...data, files: [...files, ...audios] }), [
    setData,
    data,
    audios,
  ]);

  return <ImageGrid files={images} setFiles={setImages} locked={pending_images} />;
};

const AudioEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(AudioEditorUnconnected);

export { AudioEditor };
