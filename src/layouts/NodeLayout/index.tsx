import React, { FC, memo } from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/components/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/utils/hooks/node/useNodeCoverImage';
import { useScrollToTop } from '~/utils/hooks/useScrollToTop';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { useOnNodeSeen } from '~/utils/hooks/node/useOnNodeSeen';

import styles from './styles.module.scss';
import { useNode } from '~/utils/hooks/node/useNode';
import { useNodeComments } from '~/utils/hooks/node/useNodeComments';
import { useNodeRelated } from '~/utils/hooks/node/useNodeRelated';

type IProps = RouteComponentProps<{ id: string }> & {};

const NodeLayout: FC<IProps> = memo(({ match: { params } }) => {
  const id = parseInt(params.id, 10);
  const { node, isLoading } = useNode(id);
  const {
    comments,
    isLoading: isLoadingComments,
    count: commentsCount,
    onDelete,
    onLoadMoreComments,
    onShowPhotoswipe,
  } = useNodeComments(id);

  const { related } = useNodeRelated(id);

  useNodeCoverImage(node);
  useScrollToTop([id]);
  useOnNodeSeen(node);

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
});

export { NodeLayout };
