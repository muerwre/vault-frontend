import { FC, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { createPortal } from 'react-dom';

import { imagePresets } from '~/constants/urls';
import { IFile } from '~/types';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

/** How long each photo stays before the next one fades in. */
const SLIDE_INTERVAL = 10_000;

interface Props {
  images: IFile[];
}

/**
 * The node's photos behind the first screen, crossfading one into the next.
 * Fades out as that screen scrolls away.
 */
const AuraBackdrop: FC<Props> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  // the page is pre-rendered, where there is no body to portal into
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const wrap = useRef<HTMLDivElement>(null);

  // set on the element directly, so scrolling doesn't re-render
  useEffect(() => {
    const element = wrap.current;

    if (!element) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const faded = window.scrollY / (window.innerHeight * 0.5);
      element.style.opacity = String(Math.max(0, 1 - faded));
    };

    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMounted]);

  useEffect(() => {
    setCurrent(0);

    if (images.length < 2) {
      return;
    }

    const timer = setInterval(
      () => setCurrent((index) => (index + 1) % images.length),
      SLIDE_INTERVAL,
    );

    return () => clearInterval(timer);
  }, [images]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div className={styles.wrap} ref={wrap}>
      <div className={styles.slides}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={classNames(styles.slide, {
              [styles.active]: index === current,
            })}
            style={{
              backgroundImage: `url("${getURL(image, imagePresets[1600])}")`,
            }}
          />
        ))}

        {/* 1px stripes with 2px gaps shade the photo and hide its artefacts */}
        <svg className={styles.stripes} aria-hidden>
          <defs>
            <pattern
              id="aura_stripes"
              patternUnits="userSpaceOnUse"
              width="3"
              height="3"
              patternTransform="rotate(45)"
            >
              <rect className={styles.stripe} width="1" height="3" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#aura_stripes)" />
        </svg>
      </div>
    </div>,
    document.body,
  );
};

export { AuraBackdrop };
