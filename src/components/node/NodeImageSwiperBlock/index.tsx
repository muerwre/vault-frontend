import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Keyboard, Navigation, Pagination, Zoom } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { ImageLoadingWrapper } from '~/components/common/ImageLoadingWrapper/index';
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

interface Props extends NodeComponentProps {}

const NodeImageSwiperBlock: FC<Props> = observer(({ node }) => {
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
    return () => {
      controlledSwiper?.slideTo(0, 0);
    };
  }, [controlledSwiper, images, node.id]);

  useEffect(() => {
    if (isModalActive) {
      controlledSwiper?.keyboard?.disable();
    } else {
      controlledSwiper?.keyboard?.enable();
    }
  }, [controlledSwiper?.keyboard, isModalActive]);

  if (!images?.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <Swiper
        modules={[Navigation, Pagination, Keyboard, Zoom]}
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
        keyboard={keyboard}
        grabCursor
        autoHeight
        zoom
        navigation
        watchSlidesProgress
        lazyPreloadPrevNext={1}
      >
        {images.map((file, index) => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <ImageLoadingWrapper
              preview={getURL(file, imagePresets['300'])}
              color={file.metadata?.dominant_color}
            >
              {({ loading, onLoad }) => (
                <NodeImageLazy
                  src={getURL(file)}
                  width={file.metadata?.width}
                  height={file.metadata?.height}
                  color={normalizeBrightColor(file?.metadata?.dominant_color)}
                  onLoad={onLoad}
                  onClick={() => onOpenPhotoSwipe(index)}
                  className={classNames(styles.image, 'swiper-lazy', {
                    [styles.loading]: loading,
                  })}
                  sizes={getNodeSwiperImageSizes(file, innerWidth, innerHeight)}
                  quality={90}
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
