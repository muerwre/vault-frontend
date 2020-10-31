import React, { FC } from 'react';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { Icon } from '~/components/input/Icon';

interface IProps {
  selected: boolean;
  title: string;
  type: string;
}

const TagAutocompleteRow: FC<IProps> = ({ selected, type, title }) => (
  <div className={classNames(styles.row, styles[type], { [styles.selected]: selected })}>
    <Icon icon={type} size={16} />
    <span>{title}</span>
  </div>
);

export { TagAutocompleteRow };
