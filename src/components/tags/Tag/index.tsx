import React, { FC, FocusEventHandler, useCallback } from 'react';

import { TagWrapper } from '~/components/tags/TagWrapper';
import { ITag } from '~/types';

const getTagFeature = (tag: Partial<ITag>) => {
  if (tag?.title?.substr(0, 1) === '/') return 'green';

  return '';
};

interface IProps {
  tag: Partial<ITag>;
  size?: 'normal' | 'big';

  deletable?: boolean;
  hoverable?: boolean;
  editing?: boolean;

  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: (tag: Partial<ITag>) => void;
  onDelete?: (id: ITag['ID']) => void;
}

const Tag: FC<IProps> = ({
  tag,
  deletable: deletable,
  hoverable: hoverable,
  editing: editing,
  size = 'normal',
  onClick,
  onDelete,
}) => {
  const onClickHandler = useCallback(() => {
    if (!onClick) return;
    onClick(tag);
  }, [tag, onClick]);

  const onDeleteHandler = useCallback(() => {
    if (!onDelete) {
      return;
    }

    onDelete(tag.ID!);
  }, [onDelete, tag]);

  return (
    <TagWrapper
      feature={getTagFeature(tag)}
      size={size}
      deletable={deletable}
      hoverable={hoverable}
      editing={editing}
      onClick={onClick && onClickHandler}
      onDelete={onDeleteHandler}
      title={tag.title}
    />
  );
};

export { Tag };
