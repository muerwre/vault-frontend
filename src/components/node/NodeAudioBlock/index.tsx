import React, { FC, useMemo } from 'react';
import { INode } from '~/redux/types';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import * as styles from './styles.scss';

interface IProps {
  node: INode;
}

const NodeAudioBlock: FC<IProps> = ({ node }) => {
  const audios = useMemo(
    () => node.files.filter(file => file && file.type === UPLOAD_TYPES.AUDIO),
    [node.files]
  );

  return (
    <div className={styles.wrap}>
      {audios.map(file => (
        <AudioPlayer key={file.id} file={file} />
      ))}
    </div>
  );
};

export { NodeAudioBlock };