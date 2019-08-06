import React, {FC, useCallback, useEffect} from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';

interface IProps {
  data: INode,
  setData: (val: INode) => void;
};

const ImageEditor: FC<IProps> = ({
  data,
  setData,
}) => {
  const eventPreventer = useCallback(event => event.preventDefault(), []);

  useEffect(() => {
    window.addEventListener("dragover", eventPreventer,false);
    window.addEventListener("drop",eventPreventer,false);

    return () => {
      window.removeEventListener("dragover", eventPreventer,false);
      window.removeEventListener("drop",eventPreventer,false);
    }
  }, [eventPreventer]);

  return (
    <form className={styles.uploads} onDrop={e => { console.log(e.dataTransfer.files);}}>
      <div>{data.type}</div>
    </form>
  );
};

export { ImageEditor };
