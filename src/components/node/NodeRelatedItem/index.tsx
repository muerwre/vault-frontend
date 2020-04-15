import React, { FC, memo, useCallback, useState, useMemo } from 'react';
import * as styles from './styles.scss';
import classNames from 'classnames';
import { INode } from '~/redux/types';
import { URLS, PRESETS } from '~/constants/urls';
import { RouteComponentProps, withRouter } from 'react-router';
import { getURL, stringToColour } from '~/utils/dom';

type IProps = RouteComponentProps & {
  item: Partial<INode>;
};

const getTitleLetters = (title: string): string => {
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
  const onClick = useCallback(() => history.push(URLS.NODE_URL(item.id)), [item, history]);

  const thumb = useMemo(
    () => (item.thumbnail ? getURL({ url: item.thumbnail }, PRESETS.avatar) : ''),
    [item]
  );
  const backgroundColor = useMemo(
    () => (!thumb && item.title && stringToColour(item.title)) || '',
    []
  );

  return (
    <div
      className={classNames(styles.item, { [styles.is_loaded]: is_loaded })}
      key={item.id}
      onClick={onClick}
    >
      <div
        className={styles.thumb}
        style={{
          backgroundImage: `url("${thumb}")`,
        }}
      />

      {!item.thumbnail && (
        <div className={styles.letters} style={{ backgroundColor }}>
          {getTitleLetters(item.title)}
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
