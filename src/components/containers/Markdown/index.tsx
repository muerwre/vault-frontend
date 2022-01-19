import React, { DetailedHTMLProps, FC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from '~/styles/common/markdown.module.scss';

interface IProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Markdown: FC<IProps> = ({ className, ...props }) => (
  <div className={classNames(styles.wrapper, className)} {...props} />
);

export { Markdown };
