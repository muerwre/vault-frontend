import { FC, useMemo } from 'react';

import classNames from 'classnames';
import { isAfter, parseISO } from 'date-fns';

import { useColorGradientFromString } from '~/hooks/color/useColorGradientFromString';
import { INode } from '~/types';

import { LabBottomPanel } from './components/LabBottomPanel';
import { useLabNodeBlocks } from './hooks/useLabNodeBlocks';
import styles from './styles.module.scss';

interface Props {
  node: INode;
  lastSeen: string | null | undefined;
  isLoading?: boolean;
  commentCount: number;
}

const LabNode: FC<Props> = ({ node, isLoading, lastSeen, commentCount }) => {
  const blocks = useLabNodeBlocks(node, !!isLoading);

  const hasNewComments = useMemo(
    () =>
      !!node.commented_at &&
      !!lastSeen &&
      isAfter(parseISO(node.commented_at), parseISO(lastSeen)),
    [node.commented_at, lastSeen],
  );

  const background = useColorGradientFromString(node.title, 3, 2);

  return (
    <div className={classNames(styles.wrap)} style={{ background }}>
      {blocks}

      <LabBottomPanel
        node={node}
        isLoading={isLoading}
        hasNewComments={hasNewComments}
        commentCount={commentCount}
      />
    </div>
  );
};

export { LabNode };
