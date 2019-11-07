import React, { FC, useMemo } from 'react';
import { INode } from '~/redux/types';
import * as styles from './styles.scss';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import path from 'ramda/es/path';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';

interface IProps {
  node: INode;
}

const NodeAudioImageBlock: FC<IProps> = ({ node }) => {
  const images = useMemo(
    () => node.files.filter(file => file && file.type === UPLOAD_TYPES.IMAGE),
    [node.files]
  );

  return (
    <div className={styles.wrap}>
      <div
        className={styles.slide}
        style={{ backgroundImage: `url("${getURL(path([0], images), PRESETS.hero)}")` }}
      />
    </div>
  );
};

export { NodeAudioImageBlock };
