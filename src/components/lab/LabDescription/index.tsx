import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import styles from './styles.module.scss';
import { Markdown } from '~/components/containers/Markdown';
import { formatText } from '~/utils/dom';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';
import { Paragraph } from '~/components/placeholders/Paragraph';

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
