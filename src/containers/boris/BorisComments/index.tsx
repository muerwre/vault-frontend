import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Footer } from '~/components/main/Footer';
import { NodeCommentFormSSR } from '~/components/node/NodeCommentForm/ssr';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { isSSR } from '~/constants/ssr';
import { NodeComments } from '~/containers/node/NodeComments';
import { useAuth } from '~/hooks/auth/useAuth';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useUserContext } from '~/utils/context/UserContextProvider';

interface IProps {}

const BorisComments: FC<IProps> = () => {
  const user = useUserContext();
  const { isUser } = useAuth();

  const {
    isLoading,
    comments,
    onSaveComment,
  } = useCommentContext();
  const { node } = useNodeContext();

  return (
      <Group>
        {(isUser || isSSR) && (
          <NodeCommentFormSSR user={user} nodeId={node.id} saveComment={onSaveComment} />
        )}

        {isLoading || !comments?.length ? (
          <NodeNoComments is_loading count={7} />
        ) : (
          <NodeComments order="ASC" />
        )}

        <Footer />
      </Group>
  );
};

export { BorisComments };
