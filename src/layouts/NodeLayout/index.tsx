import React, { FC, memo } from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { selectNode } from '~/redux/node/selectors';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import styles from './styles.module.scss';
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
import { canEditNode } from '~/utils/node';
import { useNodePermissions } from '~/utils/hooks/node/useNodePermissions';

type IProps = RouteComponentProps<{ id: string }> & {};

const NodeLayout: FC<IProps> = memo(
  ({
    match: {
      params: { id },
    },
  }) => {
    const {
      is_loading,
      current,
      comments,
      comment_count,
      is_loading_comments,
      related,
      lastSeenCurrent,
    } = useShallowSelect(selectNode);

    useNodeCoverImage(current);
    useScrollToTop([id, comments, is_loading_comments]);
    useLoadNode(id, is_loading);
    useOnNodeSeen(current);

    const { head, block } = useNodeBlocks(current, is_loading);
    const [canEdit] = useNodePermissions(current);

    return (
      <div className={styles.wrap}>
        {head}

        <Container className={styles.content}>
          <Card className={styles.node} seamless>
            {block}

            <NodePanel node={current} isLoading={is_loading} />

            <NodeBottomBlock
              canEdit={canEdit}
              node={current}
              comments={comments}
              commentsCount={comment_count}
              commentsOrder="DESC"
              related={related}
              isLoadingComments={is_loading_comments}
              isLoading={is_loading}
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
