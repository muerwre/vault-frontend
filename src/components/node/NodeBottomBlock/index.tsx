import React, { FC } from 'react';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { NodeCommentsBlock } from '~/components/node/NodeCommentsBlock';
import { NodeCommentForm } from '~/components/node/NodeCommentForm';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { useNodeBlocks } from '~/utils/hooks/node/useNodeBlocks';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import StickyBox from 'react-sticky-box/dist/esnext';
import styles from './styles.module.scss';
import { NodeAuthorBlock } from '~/components/node/NodeAuthorBlock';
import { useNodeContext } from '~/utils/providers/NodeProvider';

interface IProps {
  isUser: boolean;
  commentsOrder: 'ASC' | 'DESC';
}

const NodeBottomBlock: FC<IProps> = ({ commentsOrder }) => {
  const { node, related, isUser, isLoading } = useNodeContext();
  const { inline } = useNodeBlocks(node, isLoading);

  if (node.deleted_at) {
    return <NodeDeletedBadge />;
  }

  return (
    <Group>
      <Padder>
        <Group horizontal className={styles.content}>
          <Group className={styles.comments}>
            {inline && <div className={styles.inline}>{inline}</div>}

            <NodeCommentsBlock order={commentsOrder} />

            {isUser && !isLoading && <NodeCommentForm nodeId={node.id} />}
          </Group>

          <div className={styles.panel}>
            <StickyBox className={styles.sticky} offsetTop={72}>
              <div className={styles.left}>
                <div className={styles.left_item}>
                  <NodeAuthorBlock user={node?.user} />
                </div>

                <div className={styles.left_item}>
                  <NodeTagsBlock />
                </div>
                <div className={styles.left_item}>
                  <NodeRelatedBlock isLoading={isLoading} node={node} related={related} />
                </div>
              </div>
            </StickyBox>
          </div>
        </Group>
      </Padder>
    </Group>
  );
};

export { NodeBottomBlock };
