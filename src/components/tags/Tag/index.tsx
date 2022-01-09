import React, { FC, FocusEventHandler, useCallback } from 'react';
import { ITag } from '~/types';
import { TagWrapper } from '~/components/tags/TagWrapper';

const getTagFeature = (tag: Partial<ITag>) => {
  if (tag?.title?.substr(0, 1) === '/') return 'green';

  return '';
};

interface IProps {
  tag: Partial<ITag>;
  size?: 'normal' | 'big';

  is_deletable?: boolean;
  is_hoverable?: boolean;
  is_editing?: boolean;

  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: (tag: Partial<ITag>) => void;
  onDelete?: (id: ITag['ID']) => void;
}

const Tag: FC<IProps> = ({
  tag,
  is_deletable,
  is_hoverable,
  is_editing,
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
      is_deletable={is_deletable}
      is_hoverable={is_hoverable}
      is_editing={is_editing}
      onClick={onClick && onClickHandler}
      onDelete={onDeleteHandler}
      title={tag.title}
    />
  );
};

export { Tag };
