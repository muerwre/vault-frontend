import { FC, useMemo, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { NodeComponentProps } from '~/constants/node';
import { useModal } from '~/hooks/modal/useModal';
import { getYoutubeId } from '~/utils/dom';

import { NODE_SWIPER_OPTIONS } from '../NodeImageSwiperBlock/options';
import swiperStyles from '../NodeImageSwiperBlock/styles.module.scss';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const VideoFrame: FC<{ id: string }> = ({ id }) => (
  <iframe
    width="560"
    height="315"
    src={`https://www.youtube.com/embed/${id}`}
    frameBorder="0"
    allowFullScreen
    title="video"
  />
);

/**
 * The head of a video post, laid out like the photo slider: videos sized to
 * fit the screen, neighbours peeking in at the sides. Only the active slide
 * mounts the player; the rest show thumbnails, so swiping away stops playback
 * and drags are not swallowed by iframes.
 */
const NodeVideoBlock: FC<Props> = observer(({ node }) => {
  const [active, setActive] = useState(0);
  const { isOpened: isModalActive } = useModal();

  const videos = useMemo(
    () =>
      (node.blocks || []).flatMap((block) => {
        const id = block.type === 'video' && getYoutubeId(block.url);
        return id ? [id] : [];
      }),
    [node.blocks],
  );

  if (!videos.length) {
    return null;
  }

  if (videos.length === 1) {
    return (
      <div className={classNames(swiperStyles.wrapper, styles.single)}>
        <div className={styles.frame}>
          <VideoFrame id={videos[0]} />
        </div>
      </div>
    );
  }

  return (
    <div className={classNames(swiperStyles.wrapper, styles.slider)}>
      <Swiper
        key={node.id}
        modules={[Navigation, Pagination, Keyboard]}
        slidesPerView="auto"
        breakpoints={NODE_SWIPER_OPTIONS.breakpoints}
        pagination={NODE_SWIPER_OPTIONS.pagination}
        keyboard={{ enabled: !isModalActive, onlyInViewport: true }}
        onSlideChange={(swiper) => setActive(swiper.activeIndex)}
        centeredSlides
        navigation
        grabCursor
        watchOverflow
      >
        {videos.map((id, index) => (
          <SwiperSlide className={swiperStyles.slide} key={`${id}-${index}`}>
            <div className={styles.frame}>
              {index === active ? (
                <VideoFrame id={id} />
              ) : (
                <div
                  className={styles.thumb}
                  style={{
                    backgroundImage: `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`,
                  }}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

export { NodeVideoBlock };
