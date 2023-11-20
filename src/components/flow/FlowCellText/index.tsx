import React, { FC, ReactElement } from 'react';

import classNames from 'classnames';

import { Markdown } from '~/components/common/Markdown';
import { formatText } from '~/utils/dom';
import { DivProps } from '~/utils/types';

import styles from './styles.module.scss';

interface Props extends DivProps {
  children: string;
  heading: string | ReactElement;
}

const FlowCellText: FC<Props> = ({ children, heading, ...rest }) => (
  <div {...rest} className={classNames(styles.text, rest.className)}>
    {heading && <div className={styles.heading}>{heading}</div>}
    <Markdown className={styles.description}>{formatText(children)}</Markdown>
  </div>
);

export { FlowCellText };
