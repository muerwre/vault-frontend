import React, { FC, useMemo } from 'react';
import { Markdown } from '~/components/containers/Markdown';
import { INodeComponentProps } from '~/redux/node/constants';
import { formatTextParagraphs } from '~/utils/dom';
import { path } from 'ramda';
import styles from './styles.module.scss';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';
import { Paragraph } from '~/components/placeholders/Paragraph';

const LabText: FC<INodeComponentProps> = ({ node, isLoading }) => {
  const content = useMemo(() => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''), [
    node.blocks,
  ]);

  const onClick = useGotoNode(node.id);

  return isLoading ? (
    <div className={styles.wrap}>
      <Paragraph lines={5} />
    </div>
  ) : (
    <Markdown
      dangerouslySetInnerHTML={{ __html: content }}
      className={styles.wrap}
      onClick={onClick}
    />
  );
};

export { LabText };
