import React, { FC, useCallback, useEffect } from 'react';
import styles from './styles.module.scss';
import { Icon } from '~/components/input/Icon';
import { IFile, IFileWithUUID } from '~/redux/types';
import uuid from 'uuid4';
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS, UPLOAD_TYPES } from '~/redux/uploads/constants';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { append, assocPath } from 'ramda';
import { selectUploads } from '~/redux/uploads/selectors';
import { connect } from 'react-redux';
import { NODE_SETTINGS } from '~/redux/node/constants';
import { IEditorComponentProps } from '~/redux/node/types';

const mapStateToProps = state => {
  const { statuses, files } = selectUploads(state);

  return { statuses, files };
};

const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & IEditorComponentProps & {
    accept?: string;
    icon?: string;
    type?: typeof UPLOAD_TYPES[keyof typeof UPLOAD_TYPES];
  };

const EditorUploadButtonUnconnected: FC<IProps> = ({
  data,
  setData,
  temp,
  setTemp,
  statuses,
  files,
  uploadUploadFiles,
  accept = 'image/*',
  icon = 'plus',
  type = UPLOAD_TYPES.IMAGE,
}) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);

  const onUpload = useCallback(
    (uploads: File[]) => {
      const current = temp.length + data.files.length;
      const limit = NODE_SETTINGS.MAX_FILES - current;

      if (current >= NODE_SETTINGS.MAX_FILES) return;

      const items: IFileWithUUID[] = Array.from(uploads).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.EDITOR,
          target: UPLOAD_TARGETS.NODES,
          type,
        })
      );

      const temps = items.map(file => file.temp_id).slice(0, limit);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [setTemp, uploadUploadFiles, temp, data, type]
  );

  const onFileAdd = useCallback(
    (file: IFile) => {
      setData(assocPath(['files'], append(file, data.files), data));
    },
    [data, setData]
  );

  useEffect(() => {
    window.addEventListener('dragover', eventPreventer, false);
    window.addEventListener('drop', eventPreventer, false);

    return () => {
      window.removeEventListener('dragover', eventPreventer, false);
      window.removeEventListener('drop', eventPreventer, false);
    };
  }, [eventPreventer]);

  useEffect(() => {
    Object.entries(statuses).forEach(([id, status]) => {
      if (temp.includes(id) && !!status.uuid && files[status.uuid]) {
        onFileAdd(files[status.uuid]);
        setTemp(temp.filter(el => el !== id));
      }
    });
  }, [statuses, files, temp, onFileAdd]);

  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      onUpload(Array.from(event.target.files));
    },
    [onUpload]
  );

  return (
    <div className={styles.wrap}>
      <input type="file" onChange={onInputChange} accept={accept} multiple />

      <div className={styles.icon}>
        <Icon size={32} icon={icon} />
      </div>
    </div>
  );
};

const EditorUploadButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditorUploadButtonUnconnected);

export { EditorUploadButton };
