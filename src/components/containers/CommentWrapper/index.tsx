import React, { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

import * as styles from './styles.scss';
import { Card } from '../Card';
import { IUser } from '~/redux/auth/types';
import { getURL } from '~/utils/dom';
import path from 'ramda/es/path';
import { PRESETS } from '~/constants/urls';

type IProps = HTMLAttributes<HTMLDivElement> & {
  // photo?: string;
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
  <Card
    className={classNames(styles.wrap, className, { is_empty, is_loading, is_same })}
    seamless
    {...props}
  >
    <div className={styles.thumb}>
      <div
        className={styles.thumb_image}
        style={{ backgroundImage: `url("${getURL(path(['photo'], user), PRESETS.avatar)}")` }}
      />
      <div className={styles.thumb_user}>~{path(['username'], user)}</div>
    </div>

    <div className={styles.text}>{children}</div>
  </Card>
);

export { CommentWrapper };
