import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { INode } from '~/types';
import { PRESETS, URLS } from '~/constants/urls';
import { RouteComponentProps } from 'react-router';
import { getURL, getURLFromString } from '~/utils/dom';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { Square } from '~/components/common/Square';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { ImageWithSSRLoad } from '~/components/common/ImageWithSSRLoad';

type IProps = {
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

const NodeRelatedItem: FC<IProps> = memo(({ item }) => {
  const onClick = useGotoNode(item.id);
  const [is_loaded, setIsLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const thumb = useMemo(
    () => (item.thumbnail ? getURL({ url: item.thumbnail }, PRESETS.avatar) : ''),
    [item]
  );

  const background = useColorGradientFromString(!thumb ? item.title : '');

  useEffect(() => {
    if (!ref.current) return;

    const cb = () => setWidth(ref.current!.getBoundingClientRect().width);

    window.addEventListener('resize', cb);

    cb();

    return () => window.removeEventListener('resize', cb);
  }, []);

  const size = useMemo<CellSize>(() => {
    if (width > 90) return 'large';
    if (width > 76) return 'medium';
    return 'small';
  }, [width]);

  const image = useMemo(() => getURL({ url: item.thumbnail }, PRESETS.avatar), [item.thumbnail]);

  return (
    <div
      className={classNames(styles.item, styles[size], { [styles.is_loaded]: is_loaded })}
      key={item.id}
      onClick={onClick}
      ref={ref}
    >
      {item.thumbnail && (
        <Square
          image={getURLFromString(item.thumbnail, 'avatar')}
          onClick={onClick}
          className={classNames(styles.thumb, { [styles.is_loaded]: is_loaded })}
        />
      )}

      {!item.thumbnail && size === 'small' && (
        <div className={styles.letters} style={{ background }}>
          {getTitleLetters(item.title)}
        </div>
      )}

      {!item.thumbnail && size !== 'small' && (
        <div className={styles.title} style={{ background }}>
          {item.title}
        </div>
      )}

      <ImageWithSSRLoad src={image} alt="loader" onLoad={() => setIsLoaded(true)} />
    </div>
  );
});

export { NodeRelatedItem };
