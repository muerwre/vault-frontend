import React, { FC } from 'react';

import classNames from 'classnames';

import { CommentAvatar } from '~/components/comment/CommentAvatar';
import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

type IProps = DivProps & {
  user: IUser;
  isEmpty?: boolean;
  isLoading?: boolean;
  isForm?: boolean;
  isNew?: boolean;
};

const CommentWrapper: FC<IProps> = ({
  user,
  className,
  isEmpty,
  isLoading,
  isForm,
  children,
  isNew,
  ...props
}) => (
  <div
    className={classNames(styles.wrap, className, {
      [styles.is_empty]: isEmpty,
      [styles.is_loading]: isLoading,
      [styles.is_new]: isNew,
    })}
    {...props}
  >
    <div className={styles.thumb}>
      <CommentAvatar user={user} className={styles.thumb_image} />
      <div className={styles.thumb_user}>~{path(['username'], user)}</div>
    </div>

    <div className={styles.text}>{children}</div>
  </div>
);

export { CommentWrapper };
