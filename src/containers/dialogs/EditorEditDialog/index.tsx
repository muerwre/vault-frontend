import React, { FC, useCallback, useMemo } from 'react';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useHistory, useRouteMatch } from 'react-router';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import styles from './styles.module.scss';
import { useGetNode } from '~/utils/hooks/data/useGetNode';

const EditorEditDialog: FC = () => {
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

  const { node, isLoading } = useGetNode(parseInt(id, 10));

  if (isLoading || !node) {
    return (
      <ModalWrapper onOverlayClick={goBack}>
        <div className={styles.loader}>
          <LoaderCircle size={64} />
        </div>
      </ModalWrapper>
    );
  }

  return <EditorDialog node={node} onRequestClose={goBack} />;
};

export { EditorEditDialog };
