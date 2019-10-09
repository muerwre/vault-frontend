import React, { FC, ChangeEventHandler, KeyboardEventHandler, FocusEventHandler } from 'react';
import * as styles from './styles.scss';
import { ITag } from '~/redux/types';

import classNames = require('classnames');

interface IProps {
  title: ITag['title'];
  feature?: ITag['feature'];

  is_hoverable?: boolean;
  onInput?: ChangeEventHandler<HTMLInputElement>;
  onKeyUp?: KeyboardEventHandler;
  onBlur?: FocusEventHandler<HTMLInputElement>;
}

const Tag: FC<IProps> = ({
  title,
  feature,

  is_hoverable,
  onInput,
  onKeyUp,
  onBlur,
}) => (
  <div className={classNames(styles.tag, feature, { is_hoverable, input: !!onInput })}>
    <div className={styles.hole} />
    <div className={styles.title}>{title}</div>

    {onInput && (
      <input
        type="text"
        value={title}
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

// </div>
