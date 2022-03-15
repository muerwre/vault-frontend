import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';

import { ImagePresets } from '~/constants/urls';
import { IUser } from '~/types/auth';
import { getURL } from '~/utils/dom';

import styles from './styles.module.scss';

interface IProps {
  cover: IUser['cover'];
}

const CoverBackdrop: FC<IProps> = ({ cover }) => {
  const ref = useRef<HTMLImageElement>(null);

  const [is_loaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => setIsLoaded(true), [setIsLoaded]);

  const image = getURL(cover, ImagePresets.cover);

  useEffect(() => {
    if (!cover || !cover.url || !ref || !ref.current) return;

    ref.current.src = '';
    setIsLoaded(false);
    ref.current.src = getURL(cover, ImagePresets.cover);
  }, [cover]);

  if (!cover) return null;

  return (
    <div
      className={classNames(styles.cover, { [styles.active]: is_loaded })}
      style={{ backgroundImage: `url("${image}")` }}
    >
      {
        // TODO: use ImageWithSSRLoad here if you will face any bugs
      }
      <img onLoad={onLoad} ref={ref} alt="" />
    </div>
  );
};

export { CoverBackdrop };
