import React, { FC } from 'react';

import SwiperCore, { A11y, Navigation, Pagination } from 'swiper';

import { ImagePreloader } from '~/components/media/ImagePreloader';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { INodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { normalizeBrightColor } from '~/utils/color';

import styles from './styles.module.scss';

SwiperCore.use([Navigation, Pagination, A11y]);

interface IProps extends INodeComponentProps {}

const LabImage: FC<IProps> = ({ node, isLoading }) => {
  const images = useNodeImages(node);
  const onClick = useGotoNode(node.id);

  if (!images?.length && !isLoading) {
    return null;
  }

  const file = images[0];

  return (
    <Placeholder active={isLoading} width="100%" height={400}>
      <div className={styles.wrapper}>
        <ImagePreloader
          file={file}
          onClick={onClick}
          className={styles.image}
          color={normalizeBrightColor(file?.metadata?.dominant_color)}
        />
      </div>
    </Placeholder>
  );
};

export { LabImage };
