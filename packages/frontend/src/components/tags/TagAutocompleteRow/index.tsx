import { FC, useCallback } from 'react';

import classNames from 'classnames';

import { Icon } from '~/components/common/Icon';

import styles from './styles.module.scss';

interface Props {
  selected: boolean;
  title: string;
  type: 'enter' | 'right' | 'tag';
  onSelect: (val: string) => void;
}

const TagAutocompleteRow: FC<Props> = ({ selected, type, title, onSelect }) => {
  const onClick = useCallback(() => onSelect(title), [title, onSelect]);

  return (
    <div
      className={classNames(styles.row, styles[type], {
        [styles.selected]: selected,
      })}
      onClick={onClick}
    >
      <Icon icon={type} size={16} />
      <span>{title}</span>
    </div>
  );
};

export { TagAutocompleteRow };
