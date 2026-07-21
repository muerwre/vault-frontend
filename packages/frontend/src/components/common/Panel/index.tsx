import { FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './styles.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  seamless?: boolean;
  stretchy?: boolean;
};

const Panel: FC<Props> = ({
  className,
  children,
  seamless,
  stretchy,
  ...props
}) => (
  <div
    className={classNames(styles.panel, className, { seamless, stretchy })}
    {...props}
  >
    {children}
  </div>
);

export { Panel };
