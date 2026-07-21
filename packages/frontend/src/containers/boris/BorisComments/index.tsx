import { FC } from 'react';

import { Footer } from '~/components/common/Footer';
import { Group } from '~/components/common/Group';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeCommentFormSSR } from '~/containers/node/NodeCommentForm/ssr';
import { NodeComments } from '~/containers/node/NodeComments';
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
