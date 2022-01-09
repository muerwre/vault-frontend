import React, { FC, useCallback, useMemo, useRef } from 'react';
import { EMPTY_NODE, NODE_TYPES } from '~/constants/node';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { values } from 'ramda';
import { INode } from '~/types';
import { useCreateNode } from '~/hooks/node/useCreateNode';
import { DialogComponentProps } from '~/types/modal';

export interface EditorCreateDialogProps extends DialogComponentProps {
  type: typeof NODE_TYPES[keyof typeof NODE_TYPES];
  isInLab: boolean;
}

const EditorCreateDialog: FC<EditorCreateDialogProps> = ({ type, isInLab, onRequestClose }) => {
  const isExist = useMemo(() => values(NODE_TYPES).some(el => el === type), [type]);

  const data = useRef({ ...EMPTY_NODE, type, is_promoted: !isInLab });

  const createNode = useCreateNode();

  const onSubmit = useCallback(
    async (node: INode) => {
      await createNode(node);
      onRequestClose();
    },
    [onRequestClose, createNode]
  );

  if (!type || !isExist) {
    return null;
  }

  return <EditorDialog node={data.current} onRequestClose={onRequestClose} onSubmit={onSubmit} />;
};

export { EditorCreateDialog };
