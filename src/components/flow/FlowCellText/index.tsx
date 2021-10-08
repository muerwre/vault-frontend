import React, { FC, ReactElement } from 'react';
import { Markdown } from '~/components/containers/Markdown';
import { DivProps } from '~/utils/types';
import classNames from 'classnames';
import styles from './styles.module.scss';
import { formatText } from '~/utils/dom';

interface Props extends DivProps {
  children: string;
  heading: string | ReactElement;
}

const FlowCellText: FC<Props> = ({ children, heading, ...rest }) => (
  <div {...rest} className={classNames(styles.text, rest.className)}>
    {heading && <div className={styles.heading}>{heading}</div>}
    <Markdown
      className={styles.description}
      dangerouslySetInnerHTML={{ __html: formatText(children) }}
    />
  </div>
);

export { FlowCellText };
