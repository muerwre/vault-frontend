import React, { FC } from 'react';

import classNames from 'classnames';

import { Group } from '~/components/containers/Group';
import { Icon } from '~/components/input/Icon';
import { Placeholder } from '~/components/placeholders/Placeholder';

import styles from './styles.module.scss';

interface IProps {
  icon: string;
  isLoading?: boolean;
  active?: boolean;
  onClick?: () => void;
}

const LabHeadItem: FC<IProps> = ({ icon, children, isLoading, active, onClick }) => {
  if (isLoading) {
    return (
      <Group horizontal className={styles.item} key="loading">
        <Placeholder width="32px" height={32} />
        <Placeholder width="96px" height={18} />
      </Group>
    );
  }

  return (
    <Group
      horizontal
      className={classNames(styles.item, { [styles.active]: active })}
      onClick={onClick}
    >
      <Icon icon={icon} size={24} />
      <span className={styles.text}>{children}</span>
    </Group>
  );
};

export { LabHeadItem };
