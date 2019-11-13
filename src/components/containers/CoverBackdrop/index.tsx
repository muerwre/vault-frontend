import React, { FC, useState, useCallback, useEffect } from 'react';
import { IUser } from '~/redux/auth/types';
import styles from './styles.scss';
import { getURL } from '~/utils/dom';
import { PRESETS } from '~/constants/urls';
import classNames from 'classnames';

interface IProps {
  cover: IUser['cover'];
}

const CoverBackdrop: FC<IProps> = ({ cover }) => {
  const [is_loaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => setIsLoaded(true), [setIsLoaded]);

  const image = getURL(cover, PRESETS.cover);

  useEffect(() => {
    setIsLoaded(false);
  }, [cover]);

  if (!cover) return null;

  return (
    <div
      className={classNames(styles.cover, { [styles.active]: is_loaded })}
      style={{ backgroundImage: `url("${image}")` }}
    >
      <img src={image} onLoad={onLoad} />
    </div>
  );
};

export { CoverBackdrop };
