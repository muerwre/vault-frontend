import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { useCallback } from 'react';
import { nodeDeleteTag, nodeUpdateTags } from '~/redux/node/actions';
import { INode, ITag } from '~/redux/types';
import { URLS } from '~/constants/urls';

export const useNodeTags = (id: INode['id']) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const onChange = useCallback(
    (tags: string[]) => {
      dispatch(nodeUpdateTags(id, tags));
    },
    [dispatch, id]
  );

  const onClick = useCallback(
    (tag: Partial<ITag>) => {
      if (!id || !tag?.title) {
        return;
      }

      history.push(URLS.NODE_TAG_URL(id, encodeURIComponent(tag.title)));
    },
    [history, id]
  );

  const onDelete = useCallback(
    (tagId: ITag['ID']) => {
      dispatch(nodeDeleteTag(id, tagId));
    },
    [dispatch, id]
  );

  return { onDelete, onChange, onClick };
};
