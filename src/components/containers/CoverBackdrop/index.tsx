import React, { FC, useState, useCallback, useEffect, useRef } from "react";
import { IUser } from "~/redux/auth/types";
import styles from './styles.module.scss';
import { getURL } from "~/utils/dom";
import { PRESETS } from "~/constants/urls";
import classNames from "classnames";

interface IProps {
  cover: IUser["cover"];
}

const CoverBackdrop: FC<IProps> = ({ cover }) => {
  const ref = useRef<HTMLImageElement>();

  const [is_loaded, setIsLoaded] = useState(false);

  const onLoad = useCallback(() => setIsLoaded(true), [setIsLoaded]);

  const image = getURL(cover, PRESETS.cover);

  useEffect(() => {
    if (!cover || !cover.url || !ref || !ref.current) return;

    ref.current.src = "";
    setIsLoaded(false);
    ref.current.src = getURL(cover, PRESETS.cover);
  }, [cover]);

  if (!cover) return null;

  return (
    <div
      className={classNames(styles.cover, { [styles.active]: is_loaded })}
      style={{ backgroundImage: `url("${image}")` }}
    >
      <img onLoad={onLoad} ref={ref} />
    </div>
  );
};

export { CoverBackdrop };
