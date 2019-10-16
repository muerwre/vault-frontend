import React, { FC, ChangeEventHandler, DragEventHandler, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import { INode } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ImageGrid } from '~/components/editors/ImageGrid';
import { IUploadStatus } from '~/redux/uploads/reducer';

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

const ImageEditorUnconnected: FC<IProps> = ({ data, setData, temp, statuses }) => {
  const pending_files = useMemo(() => temp.filter(id => !!statuses[id]).map(id => statuses[id]), [
    temp,
    statuses,
  ]);

  return <ImageGrid data={data} setData={setData} locked={pending_files} />;
};

const ImageEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageEditorUnconnected);

export { ImageEditor };
