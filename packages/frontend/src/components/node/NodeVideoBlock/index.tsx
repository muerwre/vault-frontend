import { FC, useMemo, useState } from 'react';

import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Keyboard, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Icon } from '~/components/common/Icon';
import { NodeComponentProps } from '~/constants/node';
import { useModal } from '~/hooks/modal/useModal';
import { getYoutubeId } from '~/utils/dom';

import { NODE_SWIPER_OPTIONS } from '../NodeImageSwiperBlock/options';
import swiperStyles from '../NodeImageSwiperBlock/styles.module.scss';

import styles from './styles.module.scss';

interface Props extends NodeComponentProps {}

const VideoFrame: FC<{ id: string; autoplay?: boolean }> = ({
  id,
  autoplay,
}) => (
  <iframe
    width="560"
    height="315"
    src={`https://www.youtube.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`}
    allow="autoplay; encrypted-media; picture-in-picture"
    frameBorder="0"
    allowFullScreen
    title="video"
  />
);

/**
 * The head of a video post, laid out like the photo slider: videos sized to
 * fit the screen, neighbours peeking in at the sides. Every slide is its
 * thumbnail until the current one is clicked, which mounts the player there;
 * moving to another slide drops it, so playback stops and drags are never
 * swallowed by an iframe.
 */
const NodeVideoBlock: FC<Props> = observer(({ node }) => {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
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
        onActiveIndexChange={(swiper) => {
          setActive(swiper.activeIndex);
          setPlaying(null);
        }}
        centeredSlides
        navigation
        grabCursor
        watchOverflow
      >
        {videos.map((id, index) => (
          <SwiperSlide className={swiperStyles.slide} key={`${id}-${index}`}>
            <div className={styles.frame}>
              {playing === index ? (
                <VideoFrame id={id} autoplay />
              ) : (
                <button
                  type="button"
                  className={styles.thumb}
                  style={{
                    backgroundImage: `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`,
                  }}
                  // only the current slide plays; a click on a neighbour is
                  // the slider's, to bring it forward
                  onClick={() => index === active && setPlaying(index)}
                  aria-label="Смотреть видео"
                >
                  {index === active && (
                    <span className={styles.play}>
                      <Icon icon="play" size={32} />
                    </span>
                  )}
                </button>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

export { NodeVideoBlock };
