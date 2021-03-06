import React, { FC, useCallback } from 'react';
import { INode, ITag } from '~/redux/types';
import { URLS } from '~/constants/urls';
import { nodeUpdateTags } from '~/redux/node/actions';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { NodeTags } from '~/components/node/NodeTags';
import { useUser } from '~/utils/hooks/user/userUser';

interface IProps {
  node: INode;
  isLoading: boolean;
}

const NodeTagsBlock: FC<IProps> = ({ node, isLoading }) => {
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

  if (isLoading) {
    return null;
  }

  return (
    <NodeTags
      is_editable={is_user}
      tags={node.tags}
      onChange={onTagsChange}
      onTagClick={onTagClick}
    />
  );
};

export { NodeTagsBlock };
