import React, { FC, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { INode, IFile } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ImageGrid } from '~/components/editors/ImageGrid';
import styles from './styles.module.scss';

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

  const setFiles = useCallback((files: IFile[]) => setData({ ...data, files }), [data, setData]);

  return (
    <div className={styles.wrap}>
      <ImageGrid files={data.files} setFiles={setFiles} locked={pending_files} />
    </div>
  );
};

const ImageEditor = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageEditorUnconnected);

export { ImageEditor };
