import React, { FC, memo, useCallback } from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { selectNode } from '~/redux/node/selectors';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/components/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/utils/hooks/node/useNodeCoverImage';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { useLoadNode } from '~/utils/hooks/node/useLoadNode';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { useOnNodeSeen } from '~/utils/hooks/node/useOnNodeSeen';

import styles from './styles.module.scss';
import { useNodeFetcher } from '~/utils/hooks/node/useNodeFetcher';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { IFile } from '~/redux/types';
import { modalShowPhotoswipe } from '~/redux/modal/actions';
import { useDispatch } from 'react-redux';

type IProps = RouteComponentProps<{ id: string }> & {};

const NodeLayout: FC<IProps> = memo(
  ({
    match: {
      params: { id },
    },
  }) => {
    const { node, isLoading } = useNodeFetcher(parseInt(id, 10));
    const {
      comments,
      isLoading: isLoadingComments,
      count: commentsCount,
      onDelete,
      onLoadMoreComments,
      onShowPhotoswipe,
    } = useNodeComments(parseInt(id, 10));

    const { related } = useShallowSelect(selectNode);

    useNodeCoverImage(node);
    useScrollToTop([id]);
    useOnNodeSeen(node);
    useLoadNode(id, isLoading);

    const { head, block } = useNodeBlocks(node, isLoading);

    return (
      <div className={styles.wrap}>
        {head}

        <Container>
          <Card className={styles.node} seamless>
            {block}

            <NodePanel node={node} isLoading={isLoading} />

            <NodeBottomBlock
              node={node}
              comments={comments}
              isLoading={isLoading}
              isLoadingComments={isLoadingComments}
              commentsCount={commentsCount}
              commentsOrder="DESC"
              related={related}
              onShowPhotoswipe={onShowPhotoswipe}
              onDeleteComment={onDelete}
              onLoadMoreComments={onLoadMoreComments}
            />

            <Footer />
          </Card>
        </Container>

        <SidebarRouter prefix="/post:id" />

        <Route path={URLS.NODE_EDIT_URL(':id')} render={() => <EditorEditDialog />} />
      </div>
    );
  }
);

export { NodeLayout };
