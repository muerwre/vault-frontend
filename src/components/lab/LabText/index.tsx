import React, { FC, useCallback, useMemo } from 'react';
import { Markdown } from '~/components/containers/Markdown';
import { INodeComponentProps } from '~/redux/node/constants';
import { formatTextParagraphs } from '~/utils/dom';
import { path } from 'ramda';
import styles from './styles.module.scss';
import { useHistory } from 'react-router';
import { URLS } from '~/constants/urls';
import { useGotoNode } from '~/utils/hooks/node/useGotoNode';

const LabText: FC<INodeComponentProps> = ({ node }) => {
  const content = useMemo(() => formatTextParagraphs(path(['blocks', 0, 'text'], node) || ''), [
    node.blocks,
  ]);

  const onClick = useGotoNode(node.id);

  return (
    <Markdown
      dangerouslySetInnerHTML={{ __html: content }}
      className={styles.wrap}
      onClick={onClick}
    />
  );
};

export { LabText };
