import React, { FC, useCallback, useEffect, useState } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import SwiperCore, { A11y, Pagination, SwiperOptions } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/scrollbar/scrollbar.scss';
import 'swiper/components/zoom/zoom.scss';

import styles from './styles.module.scss';
import { useNodeImages } from '~/utils/hooks/node/useNodeImages';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import SwiperClass from 'swiper/types/swiper-class';
import { modalShowPhotoswipe } from '~/redux/modal/actions';
import { useDispatch } from 'react-redux';

SwiperCore.use([Pagination, A11y]);

interface IProps extends INodeComponentProps {}

const breakpoints: SwiperOptions['breakpoints'] = {
  599: {
    spaceBetween: 20,
  },
};

const NodeImageSwiperBlock: FC<IProps> = ({ node }) => {
  const dispatch = useDispatch();
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
    setTimeout(() => controlledSwiper.slideTo(0, 0), 300);
  }, [controlledSwiper]);

  useEffect(() => {
    updateSwiper();
    resetSwiper();
  }, [images, updateSwiper, resetSwiper]);

  const onOpenPhotoSwipe = useCallback(
    () => dispatch(modalShowPhotoswipe(images, controlledSwiper?.activeIndex || 0)),
    [dispatch, images, controlledSwiper]
  );

  if (!images?.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Swiper
        initialSlide={0}
        slidesPerView="auto"
        centeredSlides
        onSwiper={setControlledSwiper}
        grabCursor
        autoHeight
        breakpoints={breakpoints}
        pagination={{ type: 'fraction' }}
        observeSlideChildren
        observeParents
        resizeObserver
        watchOverflow
        onInit={resetSwiper}
        zoom
      >
        {images.map(file => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <img
              className={styles.image}
              src={getURL(file, PRESETS['1600'])}
              alt={node.title}
              onLoad={updateSwiper}
              onClick={onOpenPhotoSwipe}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { NodeImageSwiperBlock };
