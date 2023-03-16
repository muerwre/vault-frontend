import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import SwiperCore, {
  Keyboard,
  Lazy,
  Navigation,
  Pagination,
  SwiperOptions,
} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { ImageLoadingWrapper } from '~/components/common/ImageLoadingWrapper/index';
import { INodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useModal } from '~/hooks/modal/useModal';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

SwiperCore.use([Navigation, Pagination, Keyboard, Lazy]);

interface IProps extends INodeComponentProps {}

const breakpoints: SwiperOptions['breakpoints'] = {
  599: {
    spaceBetween: 20,
  },
};

const pagination = { type: 'fraction' as const };

const lazy = {
  enabled: true,
  loadPrevNextAmount: 1,
  loadOnTransitionStart: true,
  loadPrevNext: true,
  checkInView: true,
};

const NodeImageSwiperBlock: FC<IProps> = observer(({ node }) => {
  const [controlledSwiper, setControlledSwiper] = useState<
    SwiperClass | undefined
  >(undefined);
  const showPhotoSwiper = useImageModal();
  const { isOpened: isModalActive } = useModal();

  const images = useNodeImages(node);

  const keyboard = useMemo(
    () => ({
      enabled: !isModalActive,
      onlyInViewport: true,
    }),
    [isModalActive],
  );

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
      if (
        index !== controlledSwiper?.activeIndex &&
        controlledSwiper?.slideTo
      ) {
        controlledSwiper.slideTo(index, 300);
        return;
      }

      showPhotoSwiper(images, index);
    },
    [images, controlledSwiper, showPhotoSwiper],
  );

  useEffect(() => {
    controlledSwiper?.slideTo(0, 0);
    return () => controlledSwiper?.slideTo(0, 0);
  }, [images, node?.id]);

  useEffect(() => {
    if (isModalActive) {
      controlledSwiper?.keyboard.disable();
    } else {
      controlledSwiper?.keyboard.enable();
    }
  }, [isModalActive]);

  if (!images?.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Swiper
        enabled={images.length > 1}
        initialSlide={0}
        slidesPerView="auto"
        onSwiper={setControlledSwiper}
        breakpoints={breakpoints}
        pagination={pagination}
        centeredSlides
        observeSlideChildren
        observeParents
        observer
        resizeObserver
        watchOverflow
        updateOnImagesReady
        keyboard={keyboard}
        grabCursor
        autoHeight
        zoom
        navigation
        watchSlidesProgress
        lazy={lazy}
      >
        {images.map((file, index) => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <ImageLoadingWrapper
              preview={getURL(file, imagePresets['300'])}
              color={file.metadata?.dominant_color}
            >
              {({ loading, onLoad }) => (
                <img
                  data-srcset={getFileSrcSet(file)}
                  width={file.metadata?.width}
                  height={file.metadata?.height}
                  onLoad={onLoad}
                  onClick={() => onOpenPhotoSwipe(index)}
                  className={classNames(styles.image, 'swiper-lazy', {
                    [styles.loading]: loading,
                  })}
                  color={normalizeBrightColor(file?.metadata?.dominant_color)}
                  alt=""
                  sizes="(max-width: 560px) 100vw, 50vh"
                />
              )}
            </ImageLoadingWrapper>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

export { NodeImageSwiperBlock };
