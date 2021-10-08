import React, { FC, useMemo } from 'react';
import { INode } from '~/redux/types';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import styles from './styles.module.scss';
import { LabBottomPanel } from '~/components/lab/LabBottomPanel';
import { isAfter, parseISO } from 'date-fns';
import classNames from 'classnames';
import { useColorGradientFromString } from '~/utils/hooks/useColorGradientFromString';

interface IProps {
  node: INode;
  lastSeen: string | null | undefined;
  isLoading?: boolean;
  commentCount: number;
}

const LabNode: FC<IProps> = ({ node, isLoading, lastSeen, commentCount }) => {
  const { lab } = useNodeBlocks(node, !!isLoading);

  const hasNewComments = useMemo(
    () =>
      !!node.commented_at && !!lastSeen && isAfter(parseISO(node.commented_at), parseISO(lastSeen)),
    [node.commented_at, lastSeen]
  );

  const background = useColorGradientFromString(node.title, 3, 2);

  return (
    <div className={classNames(styles.wrap)} style={{ background }}>
      {lab}
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
