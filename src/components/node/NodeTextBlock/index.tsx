import React, { FC } from 'react';
import { INode } from '~/redux/types';
import path from 'ramda/es/path';
import { formatText } from '~/utils/dom';
import * as styles from './styles.scss';

interface IProps {
  node: INode;
}

const NodeTextBlock: FC<IProps> = ({ node }) => (
  <div
    className={styles.text}
    dangerouslySetInnerHTML={{
      __html: formatText(path(['blocks', 0, 'text'], node)),
    }}
  />
);

export { NodeTextBlock };
