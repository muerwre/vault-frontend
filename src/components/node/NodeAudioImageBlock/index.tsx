import React, { FC } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { getURL } from '~/utils/dom';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

interface IProps extends NodeComponentProps {}

const NodeAudioImageBlock: FC<IProps> = ({ node }) => {
  const images = useNodeImages(node);

  if (images.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div
        className={styles.slide}
        style={{
          backgroundImage: `url("${getURL(
            path([0], images),
            imagePresets.small_hero,
          )}")`,
        }}
      />
    </div>
  );
};

export { NodeAudioImageBlock };
