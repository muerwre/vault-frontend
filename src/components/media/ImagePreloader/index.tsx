import React, { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import styles from './styles.module.scss';
import { IFile } from '~/redux/types';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { Icon } from '~/components/input/Icon';
import { useResizeHandler } from '~/utils/hooks/useResizeHandler';

interface IProps {
  file: IFile;
  onLoad?: () => void;
  onClick?: MouseEventHandler;
  className?: string;
}

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1020;

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

  const [width, height] = useMemo(
    () => [file?.metadata?.width || DEFAULT_WIDTH, file?.metadata?.height || DEFAULT_HEIGHT],
    [file?.metadata]
  );

  useResizeHandler(onResize);

  const estimatedWidth = (width * maxHeight) / height;

  return (
    <>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={classNames(styles.preview, { [styles.is_loaded]: loaded })}
        style={{
          maxHeight: maxHeight,
          width: estimatedWidth,
        }}
        onClick={onClick}
      >
        <defs>
          <filter id="f1" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
          </filter>
        </defs>

        <g filter="url(#f1)">
          <rect fill="#222222" width="100%" height="100%" stroke="none" rx="8" ry="8" />

          {!hasError && (
            <image
              xlinkHref={getURL(file, PRESETS['300'])}
              width="100%"
              height="100%"
              onLoad={onLoad}
            />
          )}
        </g>
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
