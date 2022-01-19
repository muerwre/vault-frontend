import React, { FC, useCallback } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/input/Icon';

import styles from './styles.module.scss';

interface IProps {
  selected: boolean;
  title: string;
  type: string;
  onSelect: (val: string) => void;
}

const TagAutocompleteRow: FC<IProps> = ({ selected, type, title, onSelect }) => {
  const onClick = useCallback(() => onSelect(title), [title, onSelect]);

  return (
    <div
      className={classNames(styles.row, styles[type], { [styles.selected]: selected })}
      onClick={onClick}
    >
      <Icon icon={type} size={16} />
      <span>{title}</span>
    </div>
  );
};

export { TagAutocompleteRow };
