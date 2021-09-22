import React, { FC } from 'react';
import classNames from 'classnames';

import styles from './styles.module.scss';
import { IUser } from '~/redux/auth/types';
import { path } from 'ramda';
import { CommentAvatar } from '~/components/comment/CommentAvatar';
import { DivProps } from '~/utils/types';

type IProps = DivProps & {
  user: IUser;
  isEmpty?: boolean;
  isLoading?: boolean;
  isSame?: boolean;
  isForm?: boolean;
};

const CommentWrapper: FC<IProps> = ({
  user,
  className,
  isEmpty,
  isLoading,
  isSame,
  isForm,
  children,
  ...props
}) => (
  <div
    className={classNames(styles.wrap, className, {
      is_empty: isEmpty,
      is_loading: isLoading,
      is_same: isSame,
    })}
    {...props}
  >
    <div className={styles.thumb}>
      <CommentAvatar user={user} className={styles.thumb_image} withDetails={!isForm} />
      <div className={styles.thumb_user}>~{path(['username'], user)}</div>
    </div>

    <div className={styles.text}>{children}</div>
  </div>
);

export { CommentWrapper };
