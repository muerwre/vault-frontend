import React, { FC, memo } from 'react';
import { Route } from 'react-router';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/components/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/utils/hooks/node/useNodeCoverImage';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';
import { IComment, INode } from '~/redux/types';
import { INodeRelated } from '~/redux/node/types';

import styles from './styles.module.scss';

type IProps = {
  node: INode;
  lastSeenCurrent?: string;
  related: INodeRelated;
  comments: IComment[];
  commentsCount: number;
  isLoading: boolean;
  isLoadingComments: boolean;
};

const NodeLayout: FC<IProps> = memo(
  ({ node, comments, commentsCount, related, lastSeenCurrent, isLoading, isLoadingComments }) => {
    useNodeCoverImage(node);

    const { head, block } = useNodeBlocks(node, isLoading);
    const [canEdit] = useNodePermissions(node);

    return (
      <div className={styles.wrap}>
        {head}

        <Container className={styles.content}>
          <Card className={styles.node} seamless>
            {block}

            <div className={styles.panel}>
              <NodePanel node={node} isLoading={isLoading} />
            </div>

            <NodeBottomBlock
              canEdit={canEdit}
              node={node}
              comments={comments}
              commentsCount={commentsCount}
              commentsOrder="DESC"
              related={related}
              isLoadingComments={isLoadingComments}
              isLoading={isLoading}
              lastSeenCurrent={lastSeenCurrent}
            />

            <Footer />
          </Card>
        </Container>

        <SidebarRouter prefix="/post:id" />

        <Route path={URLS.NODE_EDIT_URL(':id')} component={EditorEditDialog} />
      </div>
    );
  }
);

export { NodeLayout };
