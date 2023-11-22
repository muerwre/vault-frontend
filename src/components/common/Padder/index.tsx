import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  padding?: number;
  vertical?: boolean;
  horizontal?: boolean;
};

const Padder: FC<Props> = ({
  padding,
  children,
  className,
  style = {},
  vertical,
  horizontal,
  ...props
}) => (
  <div
    className={classNames(styles.padder, className, { vertical, horizontal })}
    style={padding ? { ...style, padding } : style}
    {...props}
  >
    {children}
  </div>
);

export { Padder };
