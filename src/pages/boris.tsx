import React, { useEffect, VFC } from 'react';
import { useDispatch } from 'react-redux';
import { useShallowSelect } from '~/hooks/data/useShallowSelect';
import { selectNode } from '~/redux/node/selectors';
import { BorisLayout } from '~/layouts/BorisLayout';
import { nodeLoadNode } from '~/redux/node/actions';
import { CommentContextProvider } from '~/utils/context/CommentContextProvider';
import { useImageModal } from '~/hooks/navigation/useImageModal';
import { useNodeComments } from '~/hooks/node/useNodeComments';
import { useBoris } from '~/hooks/boris/useBoris';
import { NodeContextProvider } from '~/utils/context/NodeContextProvider';
import { useGetNode } from '~/hooks/node/useGetNode';

const BorisPage: VFC = () => {
  const dispatch = useDispatch();
  const { node, isLoading, update } = useGetNode(696);
  const {
    comments,
    comment_count: count,
    is_loading_comments: isLoadingComments,
  } = useShallowSelect(selectNode);

  const onShowImageModal = useImageModal();
  const { onLoadMoreComments, onDelete: onDeleteComment } = useNodeComments(696);
  const { title, setIsBetaTester, isTester, stats } = useBoris(comments);
  useEffect(() => {
    dispatch(nodeLoadNode(696, 'DESC'));
  }, [dispatch]);

  return (
    <NodeContextProvider node={node} isLoading={isLoading} update={update}>
      <CommentContextProvider
        comments={comments}
        count={count}
        isLoading={isLoadingComments}
        onShowImageModal={onShowImageModal}
        onLoadMoreComments={onLoadMoreComments}
        onDeleteComment={onDeleteComment}
      >
        <BorisLayout
          title={title}
          setIsBetaTester={setIsBetaTester}
          isTester={isTester}
          stats={stats}
        />
      </CommentContextProvider>
    </NodeContextProvider>
  );
};

export default BorisPage;
