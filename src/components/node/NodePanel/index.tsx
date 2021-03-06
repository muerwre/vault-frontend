import React, { FC, memo } from 'react';
import styles from './styles.module.scss';
import { INode } from '~/redux/types';
import { NodePanelInner } from '~/components/node/NodePanelInner';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';
import { useNodeActions } from '~/utils/hooks/node/useNodeActions';
import { shallowEqual } from 'react-redux';

interface IProps {
  node: INode;
  isLoading: boolean;
}

const NodePanel: FC<IProps> = memo(({ node, isLoading }) => {
  const [can_edit, can_like, can_star] = useNodePermissions(node);
  const { onEdit, onLike, onStar, onLock } = useNodeActions(node);

  return (
    <div className={styles.place}>
      <NodePanelInner
        node={node}
        onEdit={onEdit}
        onLike={onLike}
        onStar={onStar}
        onLock={onLock}
        canEdit={can_edit}
        canLike={can_like}
        canStar={can_star}
        isLoading={!!isLoading}
      />
    </div>
  );
}, shallowEqual);

export { NodePanel };
