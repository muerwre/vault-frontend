import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { getURL } from '~/utils/dom';
import { withRouter, RouteComponentProps } from 'react-router';
import { URLS } from '~/constants/urls';
import { Icon } from '~/components/input/Icon';
import { Filler } from '~/components/containers/Filler';

type IProps = RouteComponentProps & {
  heroes: IFlowState['heroes'];
};

const FlowHeroUnconnected: FC<IProps> = ({ heroes, history }) => {
  const [limit, setLimit] = useState(Math.max(heroes.length, 10));
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState([]);
  const timer = useRef(null);

  const onLoad = useCallback(id => () => setLoaded([...loaded, id]), [setLoaded, loaded]);

  const onNext = useCallback(() => {
    clearTimeout(timer.current);

    if (loaded.length <= 1) return;

    const index = loaded.findIndex(el => el === current);

    setCurrent(index > loaded.length - 2 ? loaded[0] : loaded[index + 1]);
  }, [loaded, current, setCurrent, timer]);

  const onPrevious = useCallback(() => {
    clearTimeout(timer.current);

    if (loaded.length <= 1) return;

    const index = loaded.findIndex(el => el === current);

    setCurrent(index > 0 ? loaded[index - 1] : loaded[loaded.length - 1]);
  }, [loaded, current, setCurrent, timer]);

  useEffect(() => {
    timer.current = setTimeout(onNext, 3000);

    return () => clearTimeout(timer.current);
  }, [current]);

  useEffect(() => {
    if (current === 0 && loaded.length > 0) setCurrent(loaded[0]);
  }, [loaded]);

  useEffect(() => {
    setLimit(Math.max(heroes.length, limit));
  }, [heroes, limit]);

  const stopSliding = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(onNext, 3000);
  }, [timer]);

  const onClick = useCallback(() => {
    if (!current) return;

    history.push(URLS.NODE_URL(current));
  }, [current]);

  return (
    <div className={styles.wrap} onMouseOver={stopSliding} onFocus={stopSliding}>
      <div className={styles.info}>
        <div className={styles.title_wrap}>
          <div className={styles.title}>TITLE!</div>
        </div>

        <div className={styles.buttons}>
          <div className={styles.button} onClick={onPrevious}>
            <Icon icon="left" />
          </div>
          <div className={styles.button} onClick={onNext}>
            <Icon icon="right" />
          </div>
        </div>
      </div>

      {heroes.slice(0, limit).map(hero => (
        <div
          className={classNames(styles.hero, {
            [styles.is_visible]: loaded.includes(hero.id),
            [styles.is_active]: current === hero.id,
          })}
          style={{ backgroundImage: `url("${getURL({ url: hero.thumbnail })}")` }}
          key={hero.id}
          onClick={onClick}
        >
          <img
            src={getURL({ url: hero.thumbnail })}
            alt={hero.thumbnail}
            onLoad={onLoad(hero.id)}
          />
        </div>
      ))}
    </div>
  );
};

const FlowHero = withRouter(FlowHeroUnconnected);

export { FlowHero };
