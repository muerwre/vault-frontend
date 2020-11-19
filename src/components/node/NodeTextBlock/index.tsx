import React, { FC } from 'react';
import { INode } from '~/redux/types';
import { path } from 'ramda';
import { formatTextParagraphs } from '~/utils/dom';
import styles from './styles.module.scss';
import { INodeComponentProps } from '~/redux/node/constants';

interface IProps extends INodeComponentProps {}

const NodeTextBlock: FC<IProps> = ({ node }) => (
  <div
    className={styles.text}
    dangerouslySetInnerHTML={{
      __html: formatTextParagraphs(path(['blocks', 0, 'text'], node)),
    }}
  />
);

export { NodeTextBlock };
