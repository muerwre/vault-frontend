import React, { FC, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { INode, IFile } from '~/redux/types';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { ImageGrid } from '~/components/editors/ImageGrid';
import styles from './styles.module.scss';
import { NodeEditorProps } from '~/redux/node/types';
import { useFileUploaderContext } from '~/utils/hooks/useFileUploader';

type IProps = NodeEditorProps;

const ImageEditor: FC<IProps> = () => {
  const { pending, files, setFiles } = useFileUploaderContext()!;

  return (
    <div className={styles.wrap}>
      <ImageGrid files={files} setFiles={setFiles} locked={pending} />
    </div>
  );
};

export { ImageEditor };
