import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { observer } from 'mobx-react-lite';
import Image from 'next/future/image';
import SwiperCore, {
  Keyboard,
  Navigation,
  Pagination,
  SwiperOptions,
} from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { ImagePreloader } from '~/components/media/ImagePreloader';
import { INodeComponentProps } from '~/constants/node';
import { ImagePresets } from '~/constants/urls';
import { useModal } from '~/hooks/modal/useModal';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeImages } from '~/hooks/node/useNodeImages';
import { normalizeBrightColor } from '~/utils/color';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

SwiperCore.use([Navigation, Pagination, Keyboard]);

interface IProps extends INodeComponentProps {}

const breakpoints: SwiperOptions['breakpoints'] = {
  599: {
    spaceBetween: 20,
  },
};

const pagination = { type: 'fraction' as const };

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
      >
        {images.map((file, i) => (
          <SwiperSlide className={styles.slide} key={file.id}>
            <Image
              src={getURL(file, ImagePresets['1600'])}
              width={file.metadata?.width}
              height={file.metadata?.height}
              onLoad={updateSwiper}
              onClick={() => onOpenPhotoSwipe(i)}
              className={styles.image}
              color={normalizeBrightColor(file?.metadata?.dominant_color)}
              alt=""
              priority={i < 2}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

export { NodeImageSwiperBlock };
