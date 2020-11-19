import React, { FC, useCallback, useEffect, useState } from 'react';
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

const mapStateToProps = state => {
  const { statuses, files } = selectUploads(state);

  return { statuses, files };
};

const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  IEditorComponentProps & {};

const EditorUploadCoverButtonUnconnected: FC<IProps> = ({
  data,
  setData,
  files,
  statuses,
  uploadUploadFiles,
}) => {
  const [cover_temp, setCoverTemp] = useState<string>(null);

  useEffect(() => {
    Object.entries(statuses).forEach(([id, status]) => {
      if (cover_temp === id && !!status.uuid && files[status.uuid]) {
        setData({ ...data, cover: files[status.uuid] });
        setCoverTemp(null);
      }
    });
  }, [statuses, files, cover_temp, setData, data]);

  const onUpload = useCallback(
    (uploads: File[]) => {
      const items: IFileWithUUID[] = Array.from(uploads).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.EDITOR,
          target: UPLOAD_TARGETS.NODES,
          type: UPLOAD_TYPES.IMAGE,
        })
      );

      setCoverTemp(path([0, 'temp_id'], items));
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, setCoverTemp]
  );

  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      onUpload(Array.from(event.target.files));
    },
    [onUpload]
  );
  const onDropCover = useCallback(() => {
    setData({ ...data, cover: null });
  }, [setData, data]);

  const background = data.cover ? getURL(data.cover, PRESETS['300']) : null;
  const status = cover_temp && path([cover_temp], statuses);
  const preview = status && path(['preview'], status);

  return (
    <div className={styles.wrap}>
      <div
        className={styles.preview}
        style={{ backgroundImage: `url("${preview || background}")` }}
      >
        <div className={styles.input}>
          {!data.cover && <span>ОБЛОЖКА</span>}
          <input type="file" accept="image/*" onChange={onInputChange} />
        </div>

        {data.cover && (
          <div className={styles.button} onClick={onDropCover}>
            <Icon icon="close" />
          </div>
        )}
      </div>
    </div>
  );
};

const EditorUploadCoverButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorUploadCoverButtonUnconnected);

export { EditorUploadCoverButton };
