import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import SwiperCore, { A11y, Navigation, Pagination, SwiperOptions } from 'swiper';

import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import 'swiper/components/zoom/zoom.scss';
import 'swiper/components/navigation/navigation.scss';

import styles from './styles.module.scss';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { Placeholder } from '~/components/placeholders/Placeholder';
import { normalizeBrightColor } from '~/utils/color';
import { ImagePreloader } from '~/components/media/ImagePreloader';

SwiperCore.use([Navigation, Pagination, A11y]);

interface IProps extends INodeComponentProps {}

const breakpoints: SwiperOptions['breakpoints'] = {
  599: {
    navigation: true,
  },
};

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
