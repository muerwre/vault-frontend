import React, { FC, memo, useCallback, useState } from 'react';
import * as styles from './styles.scss';
import classNames from 'classnames';
import { INode } from '~/redux/types';
import { URLS, PRESETS } from '~/constants/urls';
import { RouteComponentProps, withRouter } from 'react-router';
import { getURL } from '~/utils/dom';

type IProps = RouteComponentProps & {
  item: Partial<INode>;
};

const NodeRelatedItemUnconnected: FC<IProps> = memo(({ item, history }) => {
  const [is_loaded, setIsLoaded] = useState(false);
  const onClick = useCallback(() => history.push(URLS.NODE_URL(item.id)), [item, history]);

  return (
    <div
      className={classNames(styles.item, { [styles.is_loaded]: is_loaded })}
      key={item.id}
      onClick={onClick}
    >
      <div
        className={styles.thumb}
        style={{ backgroundImage: `url("${getURL({ url: item.thumbnail }, PRESETS.avatar)}")` }}
      />

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
