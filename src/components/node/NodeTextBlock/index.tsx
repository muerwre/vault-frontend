import React, { FC } from 'react';
import { INode } from '~/redux/types';
import path from 'ramda/es/path';
import { formatCommentText } from '~/utils/dom';
import * as styles from './styles.scss';

interface IProps {
  node: INode;
}

const NodeTextBlock: FC<IProps> = ({ node }) => (
  <div
    className={styles.text}
    dangerouslySetInnerHTML={{
      __html: formatCommentText(null, path(['blocks', 0, 'text'], node)),
    }}
  />
);

export { NodeTextBlock };
