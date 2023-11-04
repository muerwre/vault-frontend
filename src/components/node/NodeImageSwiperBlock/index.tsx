import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import SwiperCore, { Keyboard, Lazy, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { ImageLoadingWrapper } from '~/components/common/ImageLoadingWrapper/index';
import { PinchZoom } from '~/components/media/PinchZoom';
import { NodeComponentProps } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useModal } from '~/hooks/modal/useModal';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';

import { NodeImageLazy } from '../NodeImageLazy';

import { getNodeSwiperImageSizes } from './helpers';
import { NODE_SWIPER_OPTIONS } from './options';
import styles from './styles.module.scss';

SwiperCore.use([Navigation, Pagination, Keyboard, Lazy]);

interface IProps extends NodeComponentProps {}

const NodeImageSwiperBlock: FC<IProps> = observer(({ node }) => {
  const [controlledSwiper, setControlledSwiper] = useState<SwiperClass>();
  const showPhotoSwiper = useImageModal();
  const { isOpened: isModalActive } = useModal();
  const { innerWidth, innerHeight } = useWindowSize();

  const images = useNodeImages(node);

  const keyboard = useMemo(
    () => ({
      enabled: !isModalActive,
      onlyInViewport: true,
    }),
    [isModalActive],
  );

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
  }, [controlledSwiper, images, node.id]);

  useEffect(() => {
    if (isModalActive) {
      controlledSwiper?.keyboard.disable();
    } else {
      controlledSwiper?.keyboard.enable();
    }
  }, [controlledSwiper?.keyboard, isModalActive]);

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
        breakpoints={NODE_SWIPER_OPTIONS.breakpoints}
        pagination={NODE_SWIPER_OPTIONS.pagination}
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
        lazy={NODE_SWIPER_OPTIONS.lazy}
      >
        {images.map((file, index) => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <PinchZoom>
              {({ setRef }) => (
                <ImageLoadingWrapper
                  preview={getURL(file, imagePresets['300'])}
                  color={file.metadata?.dominant_color}
                  ref={setRef}
                >
                  {({ loading, onLoad }) => (
                    <NodeImageLazy
                      src={getURL(file)}
                      width={file.metadata?.width}
                      height={file.metadata?.height}
                      color={normalizeBrightColor(
                        file?.metadata?.dominant_color,
                      )}
                      onLoad={onLoad}
                      onClick={() => onOpenPhotoSwipe(index)}
                      className={classNames(styles.image, 'swiper-lazy', {
                        [styles.loading]: loading,
                      })}
                      sizes={getNodeSwiperImageSizes(
                        file,
                        innerWidth,
                        innerHeight,
                      )}
                      quality={90}
                    />
                  )}
                </ImageLoadingWrapper>
              )}
            </PinchZoom>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

export { NodeImageSwiperBlock };
