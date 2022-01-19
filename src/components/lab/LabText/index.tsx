import React, { FC, useMemo } from 'react';

import { path } from 'ramda';

import { Markdown } from '~/components/containers/Markdown';
import { Paragraph } from '~/components/placeholders/Paragraph';
import { INodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { formatTextParagraphs } from '~/utils/dom';

import styles from './styles.module.scss';


const LabText: FC<INodeComponentProps> = ({ node, isLoading }) => {
  const content = useMemo(() => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''), [
    node,
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
