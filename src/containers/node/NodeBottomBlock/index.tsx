import { FC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { Padder } from '~/components/containers/Padder';
import { Sticky } from '~/components/containers/Sticky';
import { NodeAuthorBlock } from '~/components/node/NodeAuthorBlock';
import { NodeDeletedBadge } from '~/components/node/NodeDeletedBadge';
import { NodeNoComments } from '~/components/node/NodeNoComments';
import { NodeRelatedBlock } from '~/components/node/NodeRelatedBlock';
import { NodeTagsBlock } from '~/components/node/NodeTagsBlock';
import { NodeCommentFormSSR } from '~/containers/comments/NodeCommentForm/ssr';
import { NodeComments } from '~/containers/comments/NodeComments';
import { NodeBacklinks } from '~/containers/node/NodeBacklinks';
import { useNodeBlocks } from '~/hooks/node/useNodeBlocks';
import { useCommentContext } from '~/utils/context/CommentContextProvider';
import { useNodeContext } from '~/utils/context/NodeContextProvider';
import { useNodeRelatedContext } from '~/utils/context/NodeRelatedContextProvider';

import styles from './styles.module.scss';

interface IProps {
  commentsOrder: 'ASC' | 'DESC';
}

const NodeBottomBlock: FC<IProps> = ({ commentsOrder }) => {
  const { node, isLoading, backlinks } = useNodeContext();
  const {
    comments,
    isLoading: isLoadingComments,
    onSaveComment,
  } = useCommentContext();
  const { related, isLoading: isLoadingRelated } = useNodeRelatedContext();
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

            <article>
              {isLoading ||
              isLoadingComments ||
              (!comments.length && !inline) ? (
                <NodeNoComments loading={isLoadingComments || isLoading} />
              ) : (
                <NodeComments order={commentsOrder} />
              )}
            </article>

            <NodeCommentFormSSR saveComment={onSaveComment} />

            <div className={styles.subheader}>
              <Filler className={styles.backlinks}>
                <NodeBacklinks list={backlinks} />
              </Filler>
            </div>
          </Group>

          <aside className={styles.panel}>
            <div className={styles.left}>
              <Sticky>
                <div className={styles.left_item}>
                  <NodeAuthorBlock user={node?.user} />
                </div>

                <div className={styles.left_item}>
                  <NodeTagsBlock />
                </div>
                <div className={styles.left_item}>
                  <NodeRelatedBlock
                    isLoading={isLoadingRelated}
                    node={node}
                    related={related}
                  />
                </div>
              </Sticky>
            </div>
          </aside>
        </Group>
      </Padder>
    </Group>
  );
};

export { NodeBottomBlock };
