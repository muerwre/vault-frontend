import React, { FC } from 'react';
import classNames from 'classnames';
import * as styles from './styles.scss';

type IProps = React.HTMLAttributes<HTMLDivElement> & {
  horizontal?: boolean;
  top?: boolean;
  bottom?: boolean;
  wrap?: boolean;
};

const Group: FC<IProps> = ({
  children,
  className = '',
  horizontal = false,
  top = false,
  bottom = false,
  wrap = false,
 ...props
}) => (
  <div
    className={classNames(
      styles.group,
      {
        [styles.horizontal]: horizontal,
        [styles.vertical]: !horizontal,
        [styles.top]: top,
        [styles.bottom]: bottom,
        [styles.wrap]: wrap,
      },
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export { Group };
