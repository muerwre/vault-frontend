import React, { FC, useMemo } from 'react';
import { INode } from '~/redux/types';
import styles from './styles.module.scss';
import { UPLOAD_TYPES } from '~/redux/uploads/constants';
import path from 'ramda/es/path';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { INodeComponentProps } from '~/redux/node/constants';

interface IProps extends INodeComponentProps {}

const NodeAudioImageBlock: FC<IProps> = ({ node }) => {
  const images = useMemo(
    () => node.files.filter(file => file && file.type === UPLOAD_TYPES.IMAGE),
    [node.files]
  );

  if (images.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.slide}
        style={{ backgroundImage: `url("${getURL(path([0], images), PRESETS.small_hero)}")` }}
      />
    </div>
  );
};

export { NodeAudioImageBlock };
