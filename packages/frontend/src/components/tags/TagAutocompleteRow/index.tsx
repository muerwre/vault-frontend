import { FC, ReactNode, useCallback } from 'react';

import classNames from 'classnames';
import { ChevronRightIcon, CornerDownLeftIcon } from 'lucide-react';

import { TagIcon } from '~/components/icons';

import styles from './styles.module.scss';

const ICONS: Record<Props['type'], ReactNode> = {
  enter: <CornerDownLeftIcon size={16} />,
  right: <ChevronRightIcon size={16} />,
  tag: <TagIcon size={16} />,
};

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
      {ICONS[type]}
      <span>{title}</span>
    </div>
  );
};

export { TagAutocompleteRow };
