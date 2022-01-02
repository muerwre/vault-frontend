import React, { FC, useCallback, useState } from 'react';
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
import { ImagePreloader } from '~/components/media/ImagePreloader';
import { normalizeBrightColor } from '~/utils/color';

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
      if (index !== controlledSwiper?.activeIndex && controlledSwiper?.slideTo) {
        controlledSwiper.slideTo(index, 300);
        return;
      }

      dispatch(modalShowPhotoswipe(images, index));
    },
    [dispatch, images, controlledSwiper]
  );

  if (!images?.length) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className={styles.single}>
        <ImagePreloader
          file={images[0]}
          onClick={() => onOpenPhotoSwipe(0)}
          className={styles.image}
        />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Swiper
        enabled={images.length > 1}
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
              color={normalizeBrightColor(file?.metadata?.dominant_color)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export { NodeImageSwiperBlock };
