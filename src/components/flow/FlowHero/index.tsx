import React, { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { getURL } from '~/utils/dom';
import { withRouter, RouteComponentProps } from 'react-router';
import { URLS, PRESETS } from '~/constants/urls';
import { Icon } from '~/components/input/Icon';

type IProps = RouteComponentProps & {
  heroes: IFlowState['heroes'];
};

const FlowHeroUnconnected: FC<IProps> = ({ heroes, history }) => {
  const [limit, setLimit] = useState(Math.min(heroes.length, 6));
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState([]);
  const [is_mobile, setIsMobile] = useState(false);

  const timer = useRef(null);
  const onLoad = useCallback(id => () => setLoaded([...loaded, id]), [setLoaded, loaded]);
  const onNext = useCallback(() => {
    clearTimeout(timer.current);

    if (loaded.length <= 1) return;

    const index = loaded.findIndex(el => el === current);

    setCurrent(index > loaded.length - 2 ? loaded[0] : loaded[index + 1]);
  }, [loaded, current, setCurrent, timer]);

  const onNextPress = useCallback(() => {
    setLimit(Math.min(heroes.length, limit + 1));
    onNext();
  }, [onNext, heroes, limit, setLimit]);

  const onPrevious = useCallback(() => {
    clearTimeout(timer.current);

    if (loaded.length <= 1) return;

    const index = loaded.findIndex(el => el === current);

    setCurrent(index > 0 ? loaded[index - 1] : loaded[loaded.length - 1]);
  }, [loaded, current, setCurrent, timer]);

  useEffect(() => {
    timer.current = setTimeout(onNext, 5000);

    return () => clearTimeout(timer.current);
  }, [current]);

  useEffect(() => {
    if (current === 0 && loaded.length > 0) setCurrent(loaded[0]);
  }, [loaded]);

  useEffect(() => {
    setLimit(limit > 0 ? Math.min(heroes.length, limit) : heroes.length);
  }, [heroes, limit]);

  const stopSliding = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(onNext, 5000);
  }, [timer, onNext]);

  const onClick = useCallback(() => {
    if (!current) return;

    history.push(URLS.NODE_URL(current));
  }, [current]);

  const title = useMemo(() => {
    if (loaded.length === 0) return null;

    const item = heroes.find(hero => hero.id === current);

    if (!item || !item.title) return null;

    return item.title;
  }, [loaded, current, heroes]);

  const preset = useMemo(() => (window.innerWidth <= 768 ? PRESETS.cover : PRESETS.small_hero), []);

  return (
    <div className={styles.wrap} onMouseOver={stopSliding} onFocus={stopSliding}>
      {loaded && loaded.length > 0 && (
        <div className={styles.info}>
          <div className={styles.title_wrap}>{title}</div>

          <div className={styles.buttons}>
            <div className={styles.button} onClick={onPrevious}>
              <Icon icon="left" />
            </div>
            <div className={styles.button} onClick={onNextPress}>
              <Icon icon="right" />
            </div>
          </div>
        </div>
      )}

      {heroes.slice(0, limit).map(hero => (
        <div
          className={classNames(styles.hero, {
            [styles.is_visible]: loaded.includes(hero.id),
            [styles.is_active]: current === hero.id,
          })}
          style={{
            backgroundImage: `url("${getURL({ url: hero.thumbnail }, preset)}")`,
          }}
          key={hero.id}
          onClick={onClick}
        >
          <img
            src={getURL({ url: hero.thumbnail }, preset)}
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
