import React, { FC, useCallback, useMemo, useRef } from 'react';
import { EMPTY_NODE, NODE_TYPES } from '~/redux/node/constants';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useHistory, useRouteMatch } from 'react-router';
import { values } from 'ramda';

const EditorCreateDialog: FC = () => {
  const history = useHistory();
  const {
    params: { type },
    url,
  } = useRouteMatch<{ type: string }>();

  const backUrl = useMemo(() => {
    return url.replace(/\/create\/(.*)$/, '');
  }, [url]);

  const goBack = useCallback(() => {
    history.replace(backUrl);
  }, [backUrl, history]);

  const isExist = useMemo(() => values(NODE_TYPES).some(el => el === type), [type]);

  const data = useRef({ ...EMPTY_NODE, type });

  if (!type || !isExist) {
    return null;
  }

  return <EditorDialog node={data.current} onRequestClose={goBack} />;
};

export { EditorCreateDialog };
