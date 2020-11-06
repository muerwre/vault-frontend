import React, { FC, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { IFlowState } from '~/redux/flow/reducer';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { getURL } from '~/utils/dom';
import { withRouter, RouteComponentProps, useHistory } from 'react-router';
import { URLS, PRESETS } from '~/constants/urls';
import { Icon } from '~/components/input/Icon';
import { INode } from "~/redux/types";

type IProps = RouteComponentProps & {
  heroes: IFlowState['heroes'];
};

const FlowHeroUnconnected: FC<IProps> = ({ heroes }) => {
  const preset = useMemo(() => (window.innerWidth <= 768 ? PRESETS.cover : PRESETS.small_hero), []);
  const [limit, setLimit] = useState(6);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Partial<INode>[]>([]);
  const timer = useRef(null)
  const history = useHistory();

  const onLoad = useCallback((i: number) => {
    setLoaded([...loaded, heroes[i]])
  }, [heroes, loaded, setLoaded])

  const items = Math.min(heroes.length, limit)

  const title = useMemo(() => {
    return loaded[current]?.title || '';
  }, [loaded, current, heroes]);

  const onNext = useCallback(() => {
    if (heroes.length > limit) setLimit(limit + 1)
    setCurrent(current < items - 1 ? current + 1 : 0)
  }, [current, items, limit, heroes.length])
  const onPrev = useCallback(() => setCurrent(current > 0 ? current - 1 : items - 1), [current, items])

  const goToNode = useCallback(() => {
    history.push(URLS.NODE_URL(loaded[current].id))
  }, [current, loaded]);

  useEffect(() => {
    timer.current = setTimeout(onNext, 5000)
    return () => clearTimeout(timer.current)
  }, [current, timer.current])

  useEffect(() => {
    if (loaded.length === 1) onNext()
  }, [loaded])

  return (
    <div className={styles.wrap}>
      <div className={styles.loaders}>
        {
          heroes.slice(0, items).map((hero, i) => (
            <img src={getURL({ url: hero.thumbnail }, preset)} key={hero.id} onLoad={() => onLoad(i)} />
          ))
        }
      </div>

      {loaded.length > 0 && (
        <div className={styles.info}>
          <div className={styles.title_wrap}>{title}</div>

          <div className={styles.buttons}>
            <div className={styles.button} onClick={onPrev}>
              <Icon icon="left" />
            </div>
            <div className={styles.button} onClick={onNext}>
              <Icon icon="right" />
            </div>
          </div>
        </div>
      )}

      {loaded.slice(0, limit).map((hero, index) => (
        <div
          className={classNames(styles.hero, {
            [styles.is_visible]: true,
            [styles.is_active]: current === index,
          })}
          style={{
            backgroundImage: `url("${getURL({ url: hero.thumbnail }, preset)}")`,
          }}
          key={hero.id}
          onClick={goToNode}
        >
          <img
            src={getURL({ url: hero.thumbnail }, preset)}
            alt={hero.thumbnail}
          />
        </div>
      ))}
    </div>
  );
};

const FlowHero = withRouter(FlowHeroUnconnected);

export { FlowHero };
