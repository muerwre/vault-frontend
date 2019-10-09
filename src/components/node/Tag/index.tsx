import React, { FC, ChangeEventHandler, KeyboardEventHandler, FocusEventHandler } from 'react';
import * as styles from './styles.scss';
import { ITag } from '~/redux/types';

import classNames = require('classnames');

const getTagFeature = (tag: Partial<ITag>) => {
  if (tag.title.substr(0, 1) === '/') return 'green';

  return '';
};

interface IProps {
  tag: Partial<ITag>;

  is_hoverable?: boolean;
  onInput?: ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

const Tag: FC<IProps> = ({ tag, is_hoverable, onInput, onKeyUp, onBlur }) => (
  <div className={classNames(styles.tag, getTagFeature(tag), { is_hoverable, input: !!onInput })}>
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

export { Tag };
