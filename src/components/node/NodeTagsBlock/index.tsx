import React, { FC, useCallback } from 'react';
import { INode, ITag } from '~/redux/types';
import { URLS } from '~/constants/urls';
import { nodeDeleteTag, nodeUpdateTags } from '~/redux/node/actions';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { NodeTags } from '~/components/node/NodeTags';
import { useUser } from '~/utils/hooks/user/userUser';

interface IProps {
  node: INode;
  canEdit: boolean;
  isLoading: boolean;
}

const NodeTagsBlock: FC<IProps> = ({ node, canEdit, isLoading }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { is_user } = useUser();

  const onTagsChange = useCallback(
    (tags: string[]) => {
      dispatch(nodeUpdateTags(node.id, tags));
    },
    [dispatch, node]
  );

  const onTagClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!node?.id || !tag?.title) {
        return;
      }

      history.push(URLS.NODE_TAG_URL(node.id, encodeURIComponent(tag.title)));
    },
    [history, node]
  );

  const onTagDelete = useCallback(
    (tagId: ITag['ID']) => {
      dispatch(nodeDeleteTag(node.id, tagId));
    },
    [dispatch, node.id]
  );

  if (isLoading) {
    return null;
  }

  return (
    <NodeTags
      is_editable={is_user}
      is_deletable={canEdit}
      tags={node.tags}
      onChange={onTagsChange}
      onTagClick={onTagClick}
      onTagDelete={onTagDelete}
    />
  );
};

export { NodeTagsBlock };
