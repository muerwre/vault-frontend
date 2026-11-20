import { FC } from 'react';

import { NodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

/**
 * A node's first photo as a short strip across the top of its card: a song
 * node's cover, or a text node's first photo.
 */
const LabCover: FC<NodeComponentProps> = ({ node, isLoading }) => {
  const images = useNodeImages(node);
  const onClick = useGotoNode(node.id);

  if (isLoading || !images.length) {
    return null;
  }

  return (
    <div
      className={styles.cover}
      onClick={onClick}
      style={{
        backgroundImage: `url("${getURL(images[0], imagePresets[600])}")`,
      }}
    />
  );
};

export { LabCover };
