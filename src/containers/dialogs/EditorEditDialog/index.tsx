import React, { FC, useCallback } from 'react';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import styles from './styles.module.scss';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useUpdateNode } from '~/hooks/node/useUpdateNode';
import { INode } from '~/types';
import { observer } from 'mobx-react-lite';
import { DialogComponentProps } from '~/types/modal';

export interface EditorEditDialogProps extends DialogComponentProps {
  nodeId: number;
}

const EditorEditDialog: FC<EditorEditDialogProps> = observer(({ nodeId, onRequestClose }) => {
  const { node, isLoading } = useLoadNode(nodeId);
  const updateNode = useUpdateNode(nodeId);

  const onSubmit = useCallback(
    async (node: INode) => {
      await updateNode(node);
      onRequestClose();
    },
    [updateNode, onRequestClose]
  );

  if (isLoading || !node) {
    return (
      <ModalWrapper onOverlayClick={onRequestClose}>
        <div className={styles.loader}>
          <LoaderCircle size={64} />
        </div>
      </ModalWrapper>
    );
  }

  return <EditorDialog node={node} onRequestClose={onRequestClose} onSubmit={onSubmit} />;
});

export { EditorEditDialog };
