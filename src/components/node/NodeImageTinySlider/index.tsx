import React, { FC, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import { FullWidth } from '~/components/containers/FullWidth';
import { useNodeImages } from '~/utils/node';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import TinySlider from 'tiny-slider-react';
import styles from './styles.module.scss';
import { TinySliderInstance, TinySliderSettings } from 'tiny-slider';
import { useArrows } from '~/utils/hooks/keys';

const settings: TinySliderSettings & { center: boolean } = {
  nav: false,
  mouseDrag: true,
  gutter: 10,
  center: true,
  lazyload: true,
  items: 1,
  edgePadding: 150,
  loop: false,
  arrowKeys: false,
  // prevButton: false,
  // nextButton: false,
  autoHeight: true,
  swipeAngle: 45,
  responsive: {
    0: {
      edgePadding: 10,
      gutter: 40,
    },
    768: {
      edgePadding: 50,
    },
    1024: {
      edgePadding: 150,
    },
  },
};

const NodeImageTinySlider: FC<INodeComponentProps> = ({ node }) => {
  const ref = useRef(null);
  const slides = useRef<HTMLDivElement[]>([]);
  const images = useNodeImages(node);
  const [current, setCurrent] = useState(0);
  const [height, setHeight] = useState(images[0]?.metadata?.height || 0);

  const onResize = useCallback(() => {
    if (!ref.current) return;
    ref.current.slider.refresh();
    const el = slides.current[current];
    if (!el) return;
    const { height } = el.getBoundingClientRect();
    setHeight(height);
  }, [ref.current, slides.current, current]);

  const onIndexChanged = useCallback(({ index }) => {
    setCurrent(index || 0);
  }, []);

  useEffect(() => {
    setCurrent(0);
  }, [node.id]);

  useEffect(onResize, [slides, current]);

  const onNext = useCallback(() => {
    if (!ref.current || images.length <= 1 || current === images.length - 1) return;
    ref.current.slider.goTo(current + 1);
  }, [ref.current, current, images]);

  const onPrev = useCallback(() => {
    if (!ref.current || images.length <= 1 || current === 0) return;
    ref.current.slider.goTo(current - 1);
  }, [ref.current, current, images]);

  useArrows(onNext, onPrev, false);

  return (
    <FullWidth onRefresh={onResize}>
      <div className={styles.slider} style={{ height }}>
        <TinySlider settings={settings} ref={ref} onTransitionEnd={onIndexChanged}>
          {images.map((image, i) => (
            <div className={styles.slide} key={image.id} ref={el => (slides.current[i] = el)}>
              <img src={getURL(image, PRESETS['1600'])} key={image.url} onLoad={onResize} />
            </div>
          ))}
        </TinySlider>
      </div>
    </FullWidth>
  );
};

export { NodeImageTinySlider };
