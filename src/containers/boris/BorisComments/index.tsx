import { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Footer } from '~/components/main/Footer';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeCommentFormSSR } from '~/containers/comments/NodeCommentForm/ssr';
import { NodeComments } from '~/containers/comments/NodeComments';
import { useCommentContext } from '~/utils/context/CommentContextProvider';

interface Props {}

const BorisComments: FC<Props> = () => {
  const { isLoading, comments, onSaveComment } = useCommentContext();

  return (
    <Group>
      <NodeCommentFormSSR saveComment={onSaveComment} />

      {isLoading || !comments?.length ? (
        <NodeNoComments loading count={7} />
      ) : (
        <NodeComments order="ASC" />
      )}

      <Footer />
    </Group>
  );
};

export { BorisComments };
