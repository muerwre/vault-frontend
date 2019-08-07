import React, { FC, useCallback, useEffect, useState } from 'react';
import uuid from 'uuid4';
import { INode, IFileWithUUID } from '~/redux/types';
import * as styles from './styles.scss';

interface IProps {
  data: INode;
  setData: (val: INode) => void;
  onUpload: (val: IFileWithUUID[]) => void;
}

const ImageEditor: FC<IProps> = ({ data, setData, onUpload }) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);
  const [temp, setTemp] = useState([]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) return;

      const files: IFileWithUUID[] = Array.from(event.dataTransfer.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = files.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      onUpload(files);
    },
    [onUpload, temp]
  );

  const onInputChange = useCallback(
    event => {
      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      const files: IFileWithUUID[] = Array.from(event.target.files).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: 'editor'
        })
      );

      const temps = files.map(file => file.temp_id);

      setTemp([...temp, ...temps]);
      onUpload(files);
    },
    [onUpload, temp]
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

  return (
    <form className={styles.uploads} onDrop={onDrop}>
      <div>{data.type}</div>
      <input type="file" onChange={onInputChange} accept="image/*" multiple />
    </form>
  );
};

export { ImageEditor };
