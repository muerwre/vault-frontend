import { DetailedHTMLProps, VFC, HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from '~/styles/common/markdown.module.scss';
import { formatText } from '~/utils/dom';

interface IProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children?: string;
}

const Markdown: VFC<IProps> = ({ className, children = '', ...props }) => (
  <div
    className={classNames(styles.wrapper, className)}
    {...props}
    dangerouslySetInnerHTML={{ __html: formatText(children) }}
  />
);

export { Markdown };
