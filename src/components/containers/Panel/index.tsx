import React, { FC, HTMLAttributes } from 'react';
import * as styles from './styles.scss';
import classNames = require("classnames");

type IProps = HTMLAttributes<HTMLDivElement> & {

}

const Panel: FC<IProps> = ({
  className,
  children,
  ...props
}) => (
    <div className={classNames(styles.panel, className)} {...props}>
      {children}
    </div>
);

export { Panel };
