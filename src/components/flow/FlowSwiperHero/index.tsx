import React, { FC, useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import SwiperCore, { Autoplay, EffectFade, Lazy, Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperClass from 'swiper/types/swiper-class';

import { Icon } from '~/components/input/Icon';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { ImagePresets, URLS } from '~/constants/urls';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { IFlowNode } from '~/types';
import { getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

SwiperCore.use([EffectFade, Lazy, Autoplay, Navigation]);

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
  loadPrevNextAmount: 5,
  checkInView: false,
};

export const FlowSwiperHero: FC<Props> = ({ heroes }) => {
  const { innerWidth } = useWindowSize();
  const { push } = useNavigation();

  const [controlledSwiper, setControlledSwiper] = useState<SwiperClass | undefined>(undefined);
  const [currentIndex, setCurrentIndex] = useState(heroes.length);
  const preset = useMemo(() => (innerWidth <= 768 ? ImagePresets.cover : ImagePresets.small_hero), [
    innerWidth,
  ]);

  const onNext = useCallback(() => {
    controlledSwiper?.slideNext(1);
  }, [controlledSwiper]);

  const onPrev = useCallback(() => {
    controlledSwiper?.slidePrev(1);
  }, [controlledSwiper]);

  const onIndexChange = useCallback((swiper: SwiperClass) => {
    let activeIndex = swiper.activeIndex;
    let slidesLen = swiper.slides.length;

    if (slidesLen === 0) {
      return 0;
    }

    if (swiper.params.loop) {
      switch (swiper.activeIndex) {
        case 0:
          activeIndex = slidesLen - 3;
          break;
        case slidesLen - 1:
          activeIndex = 0;
          break;
        default:
          --activeIndex;
      }
    }

    setCurrentIndex(activeIndex);
  }, []);

  const onClick = useCallback(
    (sw: SwiperClass) => {
      push(URLS.NODE_URL(heroes[sw.realIndex]?.id));
    },
    [push, heroes]
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
        lazy={lazy}
        loop
        slidesPerView={1}
        autoplay={autoplay}
        runCallbacksOnInit
        onSwiper={setControlledSwiper}
        onSlidesLengthChange={onIndexChange}
        onRealIndexChange={onIndexChange}
        onAfterInit={onIndexChange}
        onClick={onClick}
      >
        {heroes
          .filter(node => node.thumbnail)
          .map(node => (
            <SwiperSlide key={node.id}>
              <img
                src={getURLFromString(node.thumbnail!, preset)}
                alt=""
                className={classNames(styles.preview, 'swiper-lazy')}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
};
