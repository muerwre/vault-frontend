import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { LabNodesSort } from '~/types/lab';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface IProps {
  isLoading?: boolean;
}

const LabHead: FC<IProps> = ({ isLoading }) => {
  const { sort, setSort } = useLabContext();

  return (
    <Group className={styles.wrap} horizontal>
      <HorizontalMenu>
        <HorizontalMenu.Item
          color="green"
          icon="recent"
          active={sort === LabNodesSort.New}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.New)}
        >
          Свежие
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="orange"
          icon="hot"
          active={sort === LabNodesSort.Hot}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.Hot)}
        >
          Популярные
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="yellow"
          icon="star_full"
          isLoading={isLoading}
          active={sort === LabNodesSort.Heroic}
          onClick={() => setSort(LabNodesSort.Heroic)}
        >
          Важные
        </HorizontalMenu.Item>
      </HorizontalMenu>
    </Group>
  );
};

export { LabHead };
