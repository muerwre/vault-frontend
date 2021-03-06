import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { INode } from '~/redux/types';
import { PRESETS, URLS } from '~/constants/urls';
import { RouteComponentProps, withRouter } from 'react-router';
import { getURL, stringToColour } from '~/utils/dom';

type IProps = RouteComponentProps & {
  item: Partial<INode>;
};

type CellSize = 'small' | 'medium' | 'large';

const getTitleLetters = (title?: string): string => {
  const words = (title && title.split(' ')) || [];

  if (!words.length) return '';

  return words.length > 1
    ? words
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase()
    : words[0].substr(0, 2).toUpperCase();
};

const NodeRelatedItemUnconnected: FC<IProps> = memo(({ item, history }) => {
  const [is_loaded, setIsLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const onClick = useCallback(() => history.push(URLS.NODE_URL(item.id)), [item, history]);

  const thumb = useMemo(
    () => (item.thumbnail ? getURL({ url: item.thumbnail }, PRESETS.avatar) : ''),
    [item]
  );
  const backgroundColor = useMemo(
    () => (!thumb && item.title && stringToColour(item.title)) || '',
    []
  );

  useEffect(() => {
    if (!ref.current) return;

    const cb = () => setWidth(ref.current!.getBoundingClientRect().width);

    window.addEventListener('resize', cb);

    cb();

    return () => window.removeEventListener('resize', cb);
  }, [ref.current]);

  const size = useMemo<CellSize>(() => {
    if (width > 90) return 'large';
    if (width > 76) return 'medium';
    return 'small';
  }, [width]);

  return (
    <div
      className={classNames(styles.item, styles[size], { [styles.is_loaded]: is_loaded })}
      key={item.id}
      onClick={onClick}
      ref={ref}
    >
      <div
        className={styles.thumb}
        style={{
          backgroundImage: `url("${thumb}")`,
        }}
      />

      {!item.thumbnail && size === 'small' && (
        <div className={styles.letters} style={{ backgroundColor }}>
          {getTitleLetters(item.title)}
        </div>
      )}

      {!item.thumbnail && size !== 'small' && (
        <div className={styles.title} style={{ backgroundColor }}>
          {item.title}
        </div>
      )}

      <img
        src={getURL({ url: item.thumbnail }, PRESETS.avatar)}
        alt="loader"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
});

const NodeRelatedItem = withRouter(NodeRelatedItemUnconnected);

export { NodeRelatedItem };
