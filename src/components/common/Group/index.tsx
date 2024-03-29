import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  horizontal?: boolean;
  top?: boolean;
  bottom?: boolean;
  wrap?: boolean;
  seamless?: boolean;
};

const Group: FC<Props> = ({
  children,
  className = '',
  horizontal = false,
  top = false,
  bottom = false,
  wrap = false,
  seamless = false,
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
        [styles.seamless]: seamless,
      },
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export { Group };
