import React, { FC, MouseEventHandler, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { describeArc, getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import styles from './styles.module.scss';
import { IFile } from '~/redux/types';
import { LoaderCircleInner } from '~/components/input/LoaderCircleInner';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { Icon } from '~/components/input/Icon';

interface IProps {
  file: IFile;
  onLoad?: () => void;
  onClick?: MouseEventHandler;
  className?: string;
}

const ImagePreloader: FC<IProps> = ({ file, onLoad, onClick, className }) => {
  const [maxHeight, setMaxHeight] = useState(window.innerHeight - 140);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const onImageLoad = useCallback(() => {
    setLoaded(true);
    setHasError(false);

    if (onLoad) {
      onLoad();
    }
  }, [setLoaded, onLoad]);

  const onResize = useCallback(() => {
    setMaxHeight(window.innerHeight - 140);
  }, [setMaxHeight]);

  const onError = useCallback(() => {
    setHasError(true);
  }, [setHasError]);

  useEffect(() => {
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  return (
    <>
      <svg
        viewBox={`0 0 ${file?.metadata?.width || 0} ${file?.metadata?.height || 0}`}
        className={classNames(styles.preview, { [styles.is_loaded]: loaded })}
        style={{
          maxHeight,
          height: file?.metadata?.height || 'auto',
        }}
        onClick={onClick}
      >
        <defs>
          <filter id="f1" x="0" y="0">
            <feGaussianBlur
              stdDeviation="30 30"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              in="blend"
              edgeMode="none"
              result="blur2"
            />
          </filter>
        </defs>

        <rect fill="#242222" width="100%" height="100%" stroke="none" rx="8" ry="8" />

        {!hasError && (
          <image
            xlinkHref={getURL(file, PRESETS['300'])}
            width="100%"
            height="100%"
            filter="url(#f1)"
          />
        )}
      </svg>

      <img
        className={classNames(styles.image, { [styles.is_loaded]: loaded }, className)}
        src={getURL(file, PRESETS['1600'])}
        alt=""
        key={file.id}
        onLoad={onImageLoad}
        style={{ maxHeight }}
        onClick={onClick}
        onError={onError}
      />

      {!loaded && !hasError && <LoaderCircle className={styles.icon} size={64} />}

      {hasError && (
        <div className={styles.error}>
          <div className={styles.error__text}>Не удалось получить картинку</div>
          <Icon icon="warn" size={64} />
        </div>
      )}
    </>
  );
};

export { ImagePreloader };
