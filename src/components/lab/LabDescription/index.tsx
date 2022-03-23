import React, { FC } from 'react';

import { Markdown } from '~/components/containers/Markdown';
import { Paragraph } from '~/components/placeholders/Paragraph';
import { INodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { formatText } from '~/utils/dom';

import styles from './styles.module.scss';

const LabDescription: FC<INodeComponentProps> = ({ node, isLoading }) => {
  const onClick = useGotoNode(node.id);

  if (!node.description) {
    return null;
  }

  return isLoading ? (
    <div className={styles.wrap}>
      <Paragraph />
    </div>
  ) : (
    <Markdown
      className={styles.wrap}
      dangerouslySetInnerHTML={{ __html: formatText(node.description) }}
      onClick={onClick}
    />
  );
};

export { LabDescription };
