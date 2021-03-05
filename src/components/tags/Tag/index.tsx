import React, { FC, FocusEventHandler, useCallback } from 'react';
import { ITag } from '~/redux/types';
import { TagWrapper } from '~/components/tags/TagWrapper';

const getTagFeature = (tag: Partial<ITag>) => {
  if (tag?.title?.substr(0, 1) === '/') return 'green';

  return '';
};

interface IProps {
  tag: Partial<ITag>;
  size?: 'normal' | 'big';

  is_hoverable?: boolean;
  is_editing?: boolean;

  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: (tag: Partial<ITag>) => void;
}

const Tag: FC<IProps> = ({ tag, is_hoverable, is_editing, size = 'normal', onBlur, onClick }) => {
  const onClickHandler = useCallback(() => {
    if (!onClick) return;
    onClick(tag);
  }, [tag, onClick]);

  return (
    <TagWrapper
      feature={getTagFeature(tag)}
      size={size}
      is_hoverable={is_hoverable}
      is_editing={is_editing}
      onClick={onClick && onClickHandler}
      title={tag.title}
    />
  );
};

export { Tag };
