import { FC } from 'react';

import classNames from 'classnames';

import { IUser } from '~/types/auth';
import { path } from '~/utils/ramda';
import { DivProps } from '~/utils/types';

import { CommentAvatar } from './components/CommentAvatar';
import styles from './styles.module.scss';

type Props = DivProps & {
  user?: IUser;
  isEmpty?: boolean;
  isLoading?: boolean;
  isForm?: boolean;
  isNew?: boolean;
};

const CommentWrapper: FC<Props> = ({
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
      <CommentAvatar
        user={user}
        className={classNames(styles.thumb_image, { [styles.pointer]: user })}
      />
      <div className={styles.thumb_user}>~{path(['username'], user)}</div>
    </div>

    <div className={styles.text}>{children}</div>
  </div>
);

export { CommentWrapper };
