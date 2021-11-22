import React, { FC } from 'react';
import { Route } from 'react-router';
import { Card } from '~/components/containers/Card';

import { NodePanel } from '~/components/node/NodePanel';
import { Footer } from '~/components/main/Footer';

import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { Container } from '~/containers/main/Container';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeBottomBlock } from '~/containers/node/NodeBottomBlock';
import { useNodeCoverImage } from '~/utils/hooks/node/useNodeCoverImage';
import { URLS } from '~/constants/urls';
import { EditorEditDialog } from '~/containers/dialogs/EditorEditDialog';

import styles from './styles.module.scss';
import { useNodeContext } from '~/utils/context/NodeContextProvider';

type IProps = {};

const NodeLayout: FC<IProps> = () => {
  const { node, isLoading } = useNodeContext();
  const { head, block } = useNodeBlocks(node, isLoading);

  useNodeCoverImage(node);

  return (
    <div className={styles.wrap}>
      {head}

      <Container className={styles.content}>
        <Card className={styles.node} seamless>
          {block}

          <div className={styles.panel}>
            <NodePanel node={node} isLoading={isLoading} />
          </div>

          <NodeBottomBlock commentsOrder="DESC" />

          <Footer />
        </Card>
      </Container>

      <SidebarRouter prefix="/post:id" />

      <Route path={URLS.NODE_EDIT_URL(':id')} component={EditorEditDialog} />
    </div>
  );
};

export { NodeLayout };
