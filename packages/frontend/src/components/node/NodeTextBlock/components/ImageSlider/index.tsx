import { FC } from 'react';

import classNames from 'classnames';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import swiperStyles from '~/components/node/NodeImageSwiperBlock/styles.module.scss';
import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';
import { getFileSrcSet } from '~/utils/srcset';

import styles from './styles.module.scss';

interface Props {
  files: IFile[];
  onClick: (file: IFile) => void;
}

/**
 * Photos in a row of equal height, each at most most of the width, so the
 * next one shows at the right and invites a swipe. A click opens the viewer.
 */
const ImageSlider: FC<Props> = ({ files, onClick }) => (
  <div className={classNames(swiperStyles.wrapper, styles.wrap)}>
    <Swiper
      modules={[Navigation]}
      slidesPerView="auto"
      spaceBetween={10}
      // $lab_gap, the post body's padding: the slider runs edge to edge, the
      // first and last photos line up with the text
      slidesOffsetBefore={16}
      slidesOffsetAfter={16}
      enabled={files.length > 1}
      navigation
      grabCursor
      watchOverflow
      observer
      resizeObserver
    >
      {files.map((file) => (
        <SwiperSlide className={styles.slide} key={file.id}>
          <img
            className={styles.image}
            srcSet={getFileSrcSet(file)}
            src={getURL(file, imagePresets['1600'])}
            sizes="(max-width: 1024px) 85vw, 50vw"
            alt={file.name}
            loading="lazy"
            // known before loading, so the slider measures slides right away
            style={
              file.metadata?.width && file.metadata?.height
                ? {
                    aspectRatio: `${file.metadata.width} / ${file.metadata.height}`,
                  }
                : undefined
            }
            onClick={() => onClick(file)}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export { ImageSlider };
