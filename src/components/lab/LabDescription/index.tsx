import React, { FC } from 'react';

import { Markdown } from '~/components/containers/Markdown';
import { Paragraph } from '~/components/placeholders/Paragraph';
import { NodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { formatText } from '~/utils/dom';

import styles from './styles.module.scss';

const LabDescription: FC<NodeComponentProps> = ({ node, isLoading }) => {
  const onClick = useGotoNode(node.id);

  if (!node.description) {
    return null;
  }

  return isLoading ? (
    <div className={styles.wrap}>
      <Paragraph />
    </div>
  ) : (
    <Markdown className={styles.wrap} onClick={onClick}>
      {formatText(node.description)}
    </Markdown>
  );
};

export { LabDescription };
