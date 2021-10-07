import React, { FC } from 'react';
import { Markdown } from '~/components/containers/Markdown';
import { DivProps } from '~/utils/types';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { formatText } from '~/utils/dom';

interface Props extends DivProps {
  children: string;
  title: string;
}

const FlowCellText: FC<Props> = ({ children, title, ...rest }) => (
  <div {...rest} className={classNames(styles.text, rest.className)}>
    {title && <h4 className={styles.title}>{title}</h4>}
    <Markdown
      className={styles.description}
      dangerouslySetInnerHTML={{ __html: formatText(children) }}
    />
  </div>
);

export { FlowCellText };
