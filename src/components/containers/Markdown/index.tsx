import React, { ButtonHTMLAttributes, DetailedHTMLProps, FC, HTMLAttributes } from 'react';
import styles from '~/styles/common/markdown.module.scss';
import classNames from 'classnames';

interface IProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

const Markdown: FC<IProps> = ({ className, ...props }) => (
  <div className={classNames(styles.wrapper, className)} {...props} />
);

export { Markdown };
