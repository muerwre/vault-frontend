import React, { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IUser } from '~/redux/auth/types';
import { path } from 'ramda';
import { CommentAvatar } from '~/components/comment/CommentAvatar';
import { Card } from '~/components/containers/Card';

type IProps = HTMLAttributes<HTMLDivElement> & {
  user: IUser;
  is_empty?: boolean;
  is_loading?: boolean;
  is_same?: boolean;
};

const CommentWrapper: FC<IProps> = ({
  // photo,
  children,
  is_empty,
  is_loading,
  className,
  is_same,
  user,
  ...props
}) => (
  <div className={classNames(styles.wrap, className, { is_empty, is_loading, is_same })} {...props}>
    <div className={styles.thumb}>
      <CommentAvatar
        url={path(['photo', 'url'], user)}
        username={user.username}
        className={styles.thumb_image}
      />

      <div className={styles.thumb_user}>~{path(['username'], user)}</div>
    </div>

    <div className={styles.text}>{children}</div>
  </div>
);

export { CommentWrapper };
