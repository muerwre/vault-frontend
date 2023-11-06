import React, { FC, useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import Image from 'next/future/image';
import { Autoplay, EffectFade, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { Icon } from '~/components/input/Icon';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { imagePresets, URLS } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { IFlowNode } from '~/types';
import { getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

interface Props {
  heroes: IFlowNode[];
}

const autoplay = {
  delay: 3000,
  pauseOnMouseEnter: false,
  stopOnLastSlide: false,
  disableOnInteraction: false,
};

const lazy = {
  enabled: true,
  loadPrevNextAmount: 2,
  loadOnTransitionStart: true,
  loadPrevNext: true,
  checkInView: true,
};

const getSrcSet = (url?: string) =>
  [
    `${getURLFromString(url, imagePresets.cover)} 768w`,
    `${getURLFromString(url, imagePresets.small_hero)}`,
  ].join(', ');

export const FlowSwiperHero: FC<Props> = ({ heroes }) => {
  const { isTablet } = useWindowSize();
  const { push } = useNavigation();

  const [controlledSwiper, setControlledSwiper] = useState<
    SwiperClass | undefined
  >(undefined);
  const [currentIndex, setCurrentIndex] = useState(heroes.length);
  const preset = useMemo(
    () => (isTablet ? imagePresets.cover : imagePresets.small_hero),
    [isTablet],
  );

  const onNext = useCallback(() => {
    controlledSwiper?.slideNext(1);
  }, [controlledSwiper]);

  const onPrev = useCallback(() => {
    controlledSwiper?.slidePrev(1);
  }, [controlledSwiper]);

  const onIndexChange = useCallback((swiper: SwiperClass) => {
    if (!swiper.slides.length) {
      return;
    }

    setCurrentIndex(swiper.realIndex);
  }, []);

  const onClick = useCallback(
    (sw: SwiperClass) => {
      push(URLS.NODE_URL(heroes[sw.realIndex]?.id));
    },
    [push, heroes],
  );

  if (!heroes.length) {
    return (
      <div className={styles.loader}>
        <LoaderCircle size={200} fill="currentColor" />
      </div>
    );
  }

  const title = heroes[currentIndex]?.title;

  return (
    <div className={styles.wrap}>
      <div className={styles.slide}>
        <div className={styles.info}>
          <div className={styles.title}>{title}</div>

          <div className={styles.buttons}>
            <button className={styles.button} onClick={onPrev} type="button">
              <Icon icon="left" />
            </button>

            <button className={styles.button} onClick={onNext} type="button">
              <Icon icon="right" />
            </button>
          </div>
        </div>
      </div>

      <Swiper
        spaceBetween={300}
        effect="fade"
        speed={3000}
        className={styles.swiper}
        modules={[EffectFade, Autoplay, Navigation]}
        loop
        slidesPerView={1}
        autoplay={autoplay}
        runCallbacksOnInit
        onSwiper={setControlledSwiper}
        onSlidesLengthChange={onIndexChange}
        onRealIndexChange={onIndexChange}
        onAfterInit={onIndexChange}
        onClick={onClick}
        followFinger
        shortSwipes={false}
        watchSlidesProgress
        lazyPreloadPrevNext={3}
      >
        {heroes
          .filter((node) => node.thumbnail)
          .map((node) => (
            <SwiperSlide key={node.id}>
              <Image
                width={800}
                height={300}
                src={getURLFromString(node.thumbnail, preset)}
                alt=""
                className={classNames(styles.preview, 'swiper-lazy')}
                loading="lazy"
                style={{ objectFit: 'cover' }}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};
