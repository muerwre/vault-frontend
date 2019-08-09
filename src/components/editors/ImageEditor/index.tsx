import React, {
  FC,
  useCallback,
  useEffect,
  useState,
  ChangeEventHandler,
  DragEventHandler
} from 'react';
import uuid from 'uuid4';
import { connect } from 'react-redux';
import assocPath from 'ramda/es/assocPath';
import append from 'ramda/es/append';
import { INode, IFileWithUUID, IFile } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ImageGrid } from '~/components/editors/ImageGrid';
import { moveArrItem } from '~/utils/fn';
import { IUploadStatus } from '~/redux/uploads/reducer';

const mapStateToProps = selectUploads;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
  data: INode;
  pending_files: IUploadStatus[];
  setData: (val: INode) => void;
  onFileMove: (o: number, n: number) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onDrop: DragEventHandler<HTMLFormElement>;
};

const ImageEditorUnconnected: FC<IProps> = ({
  data,
  onFileMove,
  onInputChange,
  onDrop,
  pending_files
}) => (
  <ImageGrid
    onFileMove={onFileMove}
    items={data.files}
    locked={pending_files}
    onUpload={onInputChange}
    onDrop={onDrop}
  />
);

const ImageEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageEditorUnconnected);
export { ImageEditor };
