import { SwiperOptions } from 'swiper';

export const NODE_SWIPER_OPTIONS: SwiperOptions = {
  breakpoints: {
    599: {
      spaceBetween: 20,
    },
  },
  pagination: { type: 'fraction' as const },
  lazy: {
    enabled: true,
    loadPrevNextAmount: 1,
    loadOnTransitionStart: true,
    loadPrevNext: true,
    checkInView: true,
  },
} as const;
