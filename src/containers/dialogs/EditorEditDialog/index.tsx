import React, { FC, useCallback } from 'react';

import { observer } from 'mobx-react-lite';

import { ModalWrapper } from '~/components/common/ModalWrapper';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useUpdateNode } from '~/hooks/node/useUpdateNode';
import { INode } from '~/types';
import { DialogComponentProps } from '~/types/modal';

import styles from './styles.module.scss';

export interface EditorEditDialogProps extends DialogComponentProps {
  nodeId: number;
}

const EditorEditDialog: FC<EditorEditDialogProps> = observer(
  ({ nodeId, onRequestClose }) => {
    const { node, isLoading } = useLoadNode(nodeId);
    const updateNode = useUpdateNode(nodeId);

    const onSubmit = useCallback(
      async (node: INode) => {
        await updateNode(node);
        onRequestClose();
      },
      [updateNode, onRequestClose],
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

    return (
      <EditorDialog
        node={node}
        onRequestClose={onRequestClose}
        onSubmit={onSubmit}
      />
    );
  },
);

export { EditorEditDialog };
