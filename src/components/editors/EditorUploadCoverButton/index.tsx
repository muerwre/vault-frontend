import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { IFileWithUUID } from '~/redux/types';
import uuid from 'uuid4';
import styles from './styles.module.scss';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS, UPLOAD_TYPES } from '~/redux/uploads/constants';
import { path } from 'ramda';
import { connect } from 'react-redux';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { selectUploads } from '~/redux/uploads/selectors';
import { getURL } from '~/utils/dom';
import { Icon } from '~/components/input/Icon';
import { PRESETS } from '~/constants/urls';
import { IEditorComponentProps } from '~/redux/node/types';
import { useFileUploader, useFileUploaderContext } from '~/utils/hooks/useFileUploader';
import { useNodeFormContext } from '~/utils/hooks/useNodeFormFormik';
import { getFileType } from '~/utils/uploader';

type IProps = IEditorComponentProps & {};

const EditorUploadCoverButton: FC<IProps> = ({}) => {
  const { values, setFieldValue } = useNodeFormContext();
  const { uploadFiles, files } = useFileUploader(UPLOAD_SUBJECTS.EDITOR, UPLOAD_TARGETS.NODES, []);

  const background = values.cover ? getURL(values.cover, PRESETS['300']) : null;
  const preview = status && path(['preview'], status);

  const onDropCover = useCallback(() => {
    setFieldValue('cover', null);
  }, [setFieldValue]);

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])
        .filter(file => getFileType(file) === UPLOAD_TYPES.IMAGE)
        .slice(0, 1);

      uploadFiles(files);
    },
    [uploadFiles]
  );

  useEffect(() => {
    if (!files.length) {
      return;
    }

    setFieldValue('cover', files[files.length - 1]);
  }, [files, setFieldValue]);

  return (
    <div className={styles.wrap}>
      <div
        className={styles.preview}
        style={{ backgroundImage: `url("${preview || background}")` }}
      >
        <div className={styles.input}>
          {!values.cover && <span>ОБЛОЖКА</span>}
          <input type="file" accept="image/*" onChange={onInputChange} />
        </div>

        {values.cover && (
          <div className={styles.button} onClick={onDropCover}>
            <Icon icon="close" />
          </div>
        )}
      </div>
    </div>
  );
};

export { EditorUploadCoverButton };
