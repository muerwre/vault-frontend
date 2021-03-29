import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { EMPTY_NODE } from '~/redux/node/constants';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useHistory, useRouteMatch } from 'react-router';
import { ModalWrapper } from '~/components/dialogs/ModalWrapper';
import { apiGetNodeWithCancel } from '~/redux/node/api';
import { LoaderCircle } from '~/components/input/LoaderCircle';
import styles from './styles.module.scss';

const EditorEditDialog: FC = () => {
  const [data, setData] = useState(EMPTY_NODE);
  const [isLoading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!id) {
      return;
    }

    const { request, cancel } = apiGetNodeWithCancel({ id });

    setLoading(true);
    request
      .then(data => setData(data.node))
      .then(() => setLoading(false))
      .catch(console.log);

    return () => cancel();
  }, [id]);

  if (isLoading) {
    return (
      <ModalWrapper onOverlayClick={goBack}>
        <div className={styles.loader}>
          <LoaderCircle size={64} />
        </div>
      </ModalWrapper>
    );
  }

  return <EditorDialog node={data} onRequestClose={goBack} />;
};

export { EditorEditDialog };
