import { SwiperOptions } from 'swiper/types/swiper-options.d';

export const NODE_SWIPER_OPTIONS: SwiperOptions = {
  breakpoints: {
    599: {
      spaceBetween: 20,
    },
  },
  pagination: { type: 'fraction' as const },
} as const;
