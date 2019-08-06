import React, {FC, useCallback, useEffect} from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';

interface IProps {
  data: INode,
  setData: (val: INode) => void;
  onUpload: (val: File[]) => void;
}

const ImageEditor: FC<IProps> = ({
  data,
  setData,
  onUpload,
}) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);

  const onDrop = useCallback(event => {
    event.preventDefault();

    if (!event.dataTransfer || !event.dataTransfer.files || !event.dataTransfer.files.length) return;

    onUpload(event.dataTransfer.files);
  }, [onUpload]);

  const onInputChange = useCallback(event => {
    event.preventDefault();

    if (!event.target.files || !event.target.files.length) return;

    onUpload(event.target.files);
  }, [onUpload]);

  useEffect(() => {
    window.addEventListener("dragover", eventPreventer,false);
    window.addEventListener("drop",eventPreventer,false);

    return () => {
      window.removeEventListener("dragover", eventPreventer,false);
      window.removeEventListener("drop",eventPreventer,false);
    }
  }, [eventPreventer]);

  return (
    <form
      className={styles.uploads}
      onDrop={onDrop}
    >
      <div>{data.type}</div>
      <input type="file" onChange={onInputChange} />
    </form>
  );
};

export { ImageEditor };
