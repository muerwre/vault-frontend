import React, { FC } from "react";
import { NodeDeletedBadge } from "~/components/node/NodeDeletedBadge";
import { Group } from "~/components/containers/Group";
import { Padder } from "~/components/containers/Padder";
import { NodeCommentForm } from "~/components/node/NodeCommentForm";
import { NodeRelatedBlock } from "~/components/node/NodeRelatedBlock";
import { useNodeBlocks } from "~/hooks/node/useNodeBlocks";
import { NodeTagsBlock } from "~/components/node/NodeTagsBlock";
import StickyBox from "react-sticky-box";
import styles from "./styles.module.scss";
import { NodeAuthorBlock } from "~/components/node/NodeAuthorBlock";
import { useNodeContext } from "~/utils/context/NodeContextProvider";
import { useCommentContext } from "~/utils/context/CommentContextProvider";
import { NodeNoComments } from "~/components/node/NodeNoComments";
import { NodeComments } from "~/containers/node/NodeComments";
import { useUserContext } from "~/utils/context/UserContextProvider";
import { useNodeRelatedContext } from "~/utils/context/NodeRelatedContextProvider";

interface IProps {
  commentsOrder: 'ASC' | 'DESC';
}

const NodeBottomBlock: FC<IProps> = ({ commentsOrder }) => {
  const user = useUserContext();
  const { node, isLoading } = useNodeContext();
  const { comments, isLoading: isLoadingComments, onSaveComment } = useCommentContext();
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

            {isLoading || isLoadingComments || (!comments.length && !inline) ? (
              <NodeNoComments is_loading={isLoadingComments || isLoading} />
            ) : (
              <NodeComments order={commentsOrder} />
            )}

            {user.is_user && !isLoading && (
              <NodeCommentForm nodeId={node.id} saveComment={onSaveComment} user={user} />
            )}
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
                  <NodeRelatedBlock isLoading={isLoadingRelated} node={node} related={related} />
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
