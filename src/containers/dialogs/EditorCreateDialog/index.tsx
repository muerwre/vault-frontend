import React, { FC, useCallback, useMemo, useRef } from 'react';
import { EMPTY_NODE, NODE_TYPES } from '~/redux/node/constants';
import { EditorDialog } from '~/containers/dialogs/EditorDialog';
import { useHistory, useRouteMatch } from 'react-router';
import { values } from 'ramda';
import { INode } from '~/redux/types';
import { useCreateNode } from '~/hooks/node/useCreateNode';

const EditorCreateDialog: FC = () => {
  const history = useHistory();
  const {
    params: { type },
    url,
  } = useRouteMatch<{ type: string }>();

  const backUrl = useMemo(() => {
    return (url && url.replace(/\/create\/(.*)$/, '')) || '/';
  }, [url]);

  const goBack = useCallback(() => {
    history.replace(backUrl);
  }, [backUrl, history]);

  const isExist = useMemo(() => values(NODE_TYPES).some(el => el === type), [type]);

  const isInLab = useMemo(() => !!url.match(/^\/lab/), [url]);

  const data = useRef({ ...EMPTY_NODE, type, is_promoted: !isInLab });

  const createNode = useCreateNode();

  const onSubmit = useCallback(
    async (node: INode) => {
      await createNode(node);
      goBack();
    },
    [goBack, createNode]
  );

  if (!type || !isExist) {
    return null;
  }

  return <EditorDialog node={data.current} onRequestClose={goBack} onSubmit={onSubmit} />;
};

export { EditorCreateDialog };
