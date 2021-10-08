import React, { FC, useCallback, useEffect, useState } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import SwiperCore, { A11y, Navigation, Pagination, SwiperOptions } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import 'swiper/components/zoom/zoom.scss';
import 'swiper/components/navigation/navigation.scss';

import styles from './styles.module.scss';
import { useNodeImages } from '~/utils/hooks/node/useNodeImages';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import SwiperClass from 'swiper/types/swiper-class';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';
import { Placeholder } from '~/components/placeholders/Placeholder';

SwiperCore.use([Navigation, Pagination, A11y]);

interface IProps extends INodeComponentProps {}

const breakpoints: SwiperOptions['breakpoints'] = {
  599: {
    navigation: true,
  },
};

const LabImage: FC<IProps> = ({ node, isLoading }) => {
  const [controlledSwiper, setControlledSwiper] = useState<SwiperClass | undefined>(undefined);

  const images = useNodeImages(node);

  const updateSwiper = useCallback(() => {
    if (!controlledSwiper) return;

    controlledSwiper.updateSlides();
    controlledSwiper.updateSize();
    controlledSwiper.update();
  }, [controlledSwiper]);

  const resetSwiper = useCallback(() => {
    if (!controlledSwiper) return;
    controlledSwiper.slideTo(0, 0);
  }, [controlledSwiper]);

  useEffect(() => {
    updateSwiper();
    resetSwiper();
  }, [images, updateSwiper, resetSwiper]);

  const onClick = useGotoNode(node.id);

  if (!images?.length && !isLoading) {
    return null;
  }

  return (
    <Placeholder active={isLoading} width="100%" height={400}>
      <div className={styles.wrapper}>
        <Swiper
          initialSlide={0}
          slidesPerView={images.length > 1 ? 1.1 : 1}
          onSwiper={setControlledSwiper}
          grabCursor
          autoHeight
          breakpoints={breakpoints}
          observeSlideChildren
          observeParents
          resizeObserver
          watchOverflow
          updateOnImagesReady
          onInit={resetSwiper}
          keyboard={{
            enabled: true,
            onlyInViewport: false,
          }}
        >
          {images.map(file => (
            <SwiperSlide className={styles.slide} key={file.id}>
              <img
                className={styles.image}
                src={getURL(file, PRESETS['1600'])}
                alt={node.title}
                onLoad={updateSwiper}
                onClick={onClick}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Placeholder>
  );
};

export { LabImage };
