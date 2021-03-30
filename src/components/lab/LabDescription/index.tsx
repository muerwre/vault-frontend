import React, { FC } from 'react';
import { INodeComponentProps } from '~/redux/node/constants';
import styles from './styles.module.scss';
import { Markdown } from '~/components/containers/Markdown';
import { formatText } from '~/utils/dom';

const LabDescription: FC<INodeComponentProps> = ({ node }) => {
  if (!node.description) {
    return null;
  }

  return (
    <Markdown
      className={styles.wrap}
      dangerouslySetInnerHTML={{ __html: formatText(node.description) }}
    />
  );
};

export { LabDescription };
