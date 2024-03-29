import { FC, useMemo } from 'react';

import { Markdown } from '~/components/common/Markdown';
import { Paragraph } from '~/components/placeholders/Paragraph';
import { NodeComponentProps } from '~/constants/node';
import { useGotoNode } from '~/hooks/node/useGotoNode';
import { formatTextParagraphs } from '~/utils/dom';
import { path } from '~/utils/ramda';

import styles from './styles.module.scss';

const LabText: FC<NodeComponentProps> = ({ node, isLoading }) => {
  const content = useMemo(
    () => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''),
    [node],
  );

  const onClick = useGotoNode(node.id);

  return isLoading ? (
    <div className={styles.wrap}>
      <Paragraph lines={5} />
    </div>
  ) : (
    <Markdown className={styles.wrap} onClick={onClick}>
      {content}
    </Markdown>
  );
};

export { LabText };
