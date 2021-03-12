import React, { FC, useMemo } from 'react';
import { INode } from '~/redux/types';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import { AudioPlayer } from '~/components/media/AudioPlayer';
import styles from './styles.module.scss';
import { INodeComponentProps } from '~/redux/node/constants';
import { useNodeAudios } from '~/utils/hooks/node/useNodeAudios';

interface IProps extends INodeComponentProps {}

const NodeAudioBlock: FC<IProps> = ({ node }) => {
  const audios = useNodeAudios(node);

  return (
    <div className={styles.wrap}>
      {audios.map(file => (
        <AudioPlayer key={file.id} file={file} />
      ))}
    </div>
  );
};

export { NodeAudioBlock };
