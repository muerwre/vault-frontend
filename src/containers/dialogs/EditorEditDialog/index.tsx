import React, { FC, useCallback, useMemo } from 'react';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useHistory, useRouteMatch } from 'react-router';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import styles from './styles.module.scss';
import { useLoadNode } from '~/hooks/node/useLoadNode';
import { useUpdateNode } from '~/hooks/node/useUpdateNode';
import { INode } from '~/types';
import { observer } from 'mobx-react';

const EditorEditDialog: FC = observer(() => {
  const history = useHistory();

  const {
    params: { id },
    url,
  } = useRouteMatch<{ id: string }>();

  const backUrl = useMemo(() => {
    return url.replace(/\/edit$/, '');
  }, [url]);

  const goBack = useCallback(() => {
    history.replace(backUrl);
  }, [backUrl, history]);

  const { node, isLoading } = useLoadNode(parseInt(id, 10));
  const updateNode = useUpdateNode(parseInt(id, 10));

  const onSubmit = useCallback(
    async (node: INode) => {
      await updateNode(node);
      goBack();
    },
    [updateNode, goBack]
  );

  if (isLoading || !node) {
    return (
      <ModalWrapper onOverlayClick={goBack}>
        <div className={styles.loader}>
          <LoaderCircle size={64} />
        </div>
      </ModalWrapper>
    );
  }

  return <EditorDialog node={node} onRequestClose={goBack} onSubmit={onSubmit} />;
});

export { EditorEditDialog };
