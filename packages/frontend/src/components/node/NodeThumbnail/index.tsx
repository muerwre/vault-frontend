import { FC, memo, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'classnames';
import { FlaskConicalIcon } from 'lucide-react';

import { ImageWithSSRLoad } from '~/components/common/ImageWithSSRLoad';
import { Square } from '~/components/common/Square';
import { NODE_TYPES } from '~/constants/node';
import { imagePresets } from '~/constants/urls';
import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { getURL, getURLFromString } from '~/utils/dom';

import styles from './styles.module.scss';

type NodeThumbnailProps = {
  item: {
    thumbnail?: string;
    title?: string;
    is_promoted?: boolean;
    id?: number;
    type?: string;
  };
};

/** Post types whose thumbnail keeps the title, over the picture if any. */
const TITLED_TYPES: string[] = [NODE_TYPES.TEXT, NODE_TYPES.AUDIO];

type CellSize = 'small' | 'medium' | 'large';

const getTitleLetters = (title?: string): string => {
  const words = (title && title.split(' ')) || [];

  if (!words.length) return '';

  return words.length > 1
    ? words
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : words[0].substr(0, 2).toUpperCase();
};

const NodeThumbnail: FC<NodeThumbnailProps> = memo(({ item }) => {
  const onClick = useGotoNode(item.id);
  const [is_loaded, setIsLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const thumb = useMemo(
    () =>
      item.thumbnail
        ? getURL({ url: item.thumbnail }, imagePresets.avatar)
        : '',
    [item],
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

  const hasTitle = !item.thumbnail || TITLED_TYPES.includes(item.type ?? '');

  const image = useMemo(
    () => getURL({ url: item.thumbnail }, imagePresets.avatar),
    [item.thumbnail],
  );

  return (
    <div
      className={classNames(styles.item, styles[size], {
        [styles.is_loaded]: is_loaded,
      })}
      key={item.id}
      onClick={onClick}
      ref={ref}
    >
      {item.thumbnail && (
        <Square
          image={getURLFromString(item.thumbnail, 'avatar')}
          onClick={onClick}
          className={classNames(styles.thumb, {
            [styles.is_loaded]: is_loaded,
          })}
        />
      )}

      {hasTitle && (
        <div
          className={classNames(
            size === 'small' ? styles.letters : styles.title,
            { [styles.over_photo]: !!item.thumbnail },
          )}
          style={item.thumbnail ? undefined : { background }}
        >
          {size === 'small' ? getTitleLetters(item.title) : item.title}
        </div>
      )}

      {!!item.thumbnail && !item.is_promoted && (
        <div className={styles.suffix}>
          <FlaskConicalIcon size={12} />
        </div>
      )}

      <ImageWithSSRLoad
        src={image}
        alt="loader"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
});

export { NodeThumbnail };
