import React, { FC, useCallback, useEffect, useState } from 'react';
import uuid from 'uuid4';
import { INode, IFileWithUUID } from '~/redux/types';
import * as styles from './styles.scss';
import * as UPLOAD_ACTIONS from '~/redux/uploads/actions';
import { connect } from 'react-redux';
import { selectUploadStatuses, selectUploads } from '~/redux/uploads/selectors';

const mapStateToProps = selectUploads;
const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {
  data: INode;
  setData: (val: INode) => void;
}

const ImageEditorUnconnected: FC<IProps> = ({ data, setData, uploadUploadFiles, statuses, files }) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);
  const [temp, setTemp] = useState([]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.dataTransfer.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      const items: IFileWithUUID[] = Array.from(event.target.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = items.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      uploadUploadFiles(items);
    },
    [uploadUploadFiles, temp]
  );

  useEffect(() => {
    window.addEventListener('dragover', eventPreventer, false);
    window.addEventListener('drop', eventPreventer, false);

    return () => {
      window.removeEventListener('dragover', eventPreventer, false);
      window.removeEventListener('drop', eventPreventer, false);
    };
  }, [eventPreventer]);

  useEffect(() => console.log({ temp }), [temp]);
  useEffect(() => console.log({ data }), [data]);

  useEffect(() => {
    console.log({ temp, files });

    Object.entries(statuses).forEach(([id, status]) => {
      // todo: make this working
      console.log({ id, uuid: status.uuid, file: files[status.uuid], files });

      if (temp.includes(id) && !!status.uuid && files[status.uuid]) {
        console.log(`${id} uploaded`);
        // do setData to append this file
        setData({ ...data, files: [...data.files, files[status.uuid]] });
        setTemp(temp.filter(el => el === id));
      }
    });
  }, [statuses, temp, setData, data, setTemp]);

  return (
    <form className={styles.uploads} onDrop={onDrop}>
      <div>{data.type}</div>
      <input type="file" onChange={onInputChange} accept="image/*" multiple />
    </form>
  );
};

const ImageEditor = connect(mapStateToProps, mapDispatchToProps)(ImageEditorUnconnected)
export { ImageEditor };
