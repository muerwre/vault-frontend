import React, { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { Card } from '../Card';

type IProps = HTMLAttributes<HTMLDivElement> & {
  photo?: string;
  is_empty?: boolean;
  is_loading?: boolean;
  is_same?: boolean;
};

const CommentWrapper: FC<IProps> = ({
  photo,
  children,
  is_empty,
  is_loading,
  className,
  is_same,
  ...props
}) => (
  <Card
    className={classNames(styles.wrap, className, { is_empty, is_loading, is_same })}
    seamless
    {...props}
  >
    <div className={styles.thumb}>
      {!is_same && photo && (
        <div className={styles.thumb_image} style={{ backgroundImage: `url("${photo}")` }} />
      )}
    </div>

    <div className={styles.text}>{children}</div>
  </Card>
);

export { CommentWrapper };
