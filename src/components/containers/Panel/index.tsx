import React, { FC, HTMLAttributes } from 'react';
import * as styles from './styles.scss';
import classNames = require("classnames");

type IProps = HTMLAttributes<HTMLDivElement> & {
  seamless?: boolean;
  stretchy?: boolean
}

const Panel: FC<IProps> = ({
  className,
  children,
  seamless,
  stretchy,
  ...props
}) => (
    <div className={classNames(styles.panel, className, { seamless, stretchy })} {...props}>
      {children}
    </div>
);

export { Panel };
