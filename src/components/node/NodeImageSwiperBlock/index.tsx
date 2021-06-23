import React, { FC, useCallback, useEffect, useState } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';
import 'swiper/components/navigation/navigation.scss';
import 'swiper/components/lazy/lazy.min.css';
import styles from './styles.module.scss';

import SwiperCore, { Keyboard, Navigation, Pagination, SwiperOptions } from 'swiper';

import { useNodeImages } from '~/utils/hooks/node/useNodeImages';
import SwiperClass from 'swiper/types/swiper-class';
import { modalShowPhotoswipe } from '~/redux/modal/actions';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import { ImagePreloader } from '~/components/media/ImagePreloader';

SwiperCore.use([Navigation, Pagination, Keyboard]);

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
    controlledSwiper.updateAutoHeight();
    controlledSwiper.updateProgress();
  }, [controlledSwiper]);

  const onOpenPhotoSwipe = useCallback(
    (index: number) => {
      dispatch(modalShowPhotoswipe(images, index));
    },
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
        onSwiper={setControlledSwiper}
        breakpoints={breakpoints}
        pagination={{ type: 'fraction' }}
        centeredSlides
        observeSlideChildren
        observeParents
        resizeObserver
        watchOverflow
        updateOnImagesReady
        keyboard={{
          enabled: true,
          onlyInViewport: false,
        }}
        grabCursor
        autoHeight
        zoom
        navigation
      >
        {images.map((file, i) => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <ImagePreloader
              file={file}
              onLoad={updateSwiper}
              onClick={() => onOpenPhotoSwipe(i)}
              className={styles.image}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { NodeImageSwiperBlock };
