import React, { FC, ReactElement, ChangeEvent, ChangeEventHandler } from 'react';
import * as styles from './styles.scss';
import { ITag } from '~/redux/types';

import classNames = require('classnames');

interface IProps {
  title: ITag['title'];
  feature?: ITag['feature'];

  is_hoverable?: boolean;
  onInput?: ChangeEventHandler<HTMLInputElement>;
}

const Tag: FC<IProps> = ({
  title,
  feature,

  is_hoverable,
  onInput,
}) => (
  <div className={classNames(styles.tag, feature, { is_hoverable, input: !!onInput })}>
    <div className={styles.hole} />
    <div className={styles.title}>{title}</div>

    {onInput && (
      <input
        type="text"
        value={title}
        onChange={onInput}
        size={1}
        placeholder="Добавить"
        maxLength={24}
      />
    )}
  </div>
);

export { Tag };

// </div>
