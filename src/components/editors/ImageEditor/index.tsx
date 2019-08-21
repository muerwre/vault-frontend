import React, { FC, ChangeEventHandler, DragEventHandler } from 'react';
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
    pending_files: IUploadStatus[];

    setData: (val: INode) => void;
    onFileMove: (from: number, to: number) => void;
    onInputChange: ChangeEventHandler<HTMLInputElement>;
  };

const ImageEditorUnconnected: FC<IProps> = ({
  data,
  onFileMove,
  onInputChange,
  pending_files,
}) => (
  <ImageGrid
    onFileMove={onFileMove}
    items={data.files}
    locked={pending_files}
    onUpload={onInputChange}
  />
);

const ImageEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageEditorUnconnected);

export { ImageEditor };
