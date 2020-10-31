import React, { ChangeEventHandler, FC, FocusEventHandler, KeyboardEventHandler, useCallback, } from 'react';
import * as styles from './styles.scss';
import { ITag } from '~/redux/types';
import classNames = require('classnames');

const getTagFeature = (tag: Partial<ITag>) => {
  if (tag.title.substr(0, 1) === '/') return 'green';

  return '';
};

interface IProps {
  tag: Partial<ITag>;
  size?: 'normal' | 'big';

  is_hoverable?: boolean;
  is_editing?: boolean;

  onInput?: ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onClick?: (tag: Partial<ITag>) => void;
}

const Tag: FC<IProps> = ({
  tag,
  is_hoverable,
  is_editing,
  size = 'normal',
  onInput,
  onKeyUp,
  onBlur,
  onClick,
}) => {
  const onClickHandler = useCallback(() => {
    if (!onClick) return;
    onClick(tag);
  }, [tag, onClick]);

  return (
    <div
      className={classNames(styles.tag, getTagFeature(tag), size, {
        is_hoverable,
        is_editing,
        input: !!onInput,
        clickable: !!onClick,
      })}
      onClick={onClickHandler}
    >
      <div className={styles.hole} />
      <div className={styles.title}>{tag.title}</div>

      {onInput && (
        <input
          type="text"
          value={tag.title}
          size={1}
          placeholder="Добавить"
          maxLength={24}
          onChange={onInput}
          onKeyUp={onKeyUp}
          onBlur={onBlur}
        />
      )}
    </div>
  );
};

export { Tag };
