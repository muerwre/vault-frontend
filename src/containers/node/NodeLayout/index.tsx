import React, { FC, memo } from 'react';
import { RouteComponentProps } from 'react-router';
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
    } = useShallowSelect(selectNode);

    useNodeCoverImage(current);
    useScrollToTop([id]);
    useLoadNode(id, is_loading);

    const { head, block } = useNodeBlocks(current, is_loading);

    return (
      <div className={styles.wrap}>
        {head}

        <Container>
          <Card className={styles.node} seamless>
            {block}

            <NodePanel node={current} isLoading={is_loading} />

            <NodeBottomBlock
              node={current}
              isLoadingComments={is_loading_comments}
              comments={comments}
              isLoading={is_loading}
              commentsCount={comment_count}
              commentsOrder="DESC"
              related={related}
            />

            <Footer />
          </Card>
        </Container>

        <SidebarRouter prefix="/post:id" />
      </div>
    );
  }
);

export { NodeLayout };
