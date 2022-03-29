import React, { FC } from 'react';

import { Filler } from '~/components/containers/Filler';
import { Group } from '~/components/containers/Group';
import { InputText } from '~/components/input/InputText';
import { SearchInput } from '~/components/input/SearchInput';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { LabNodesSort } from '~/types/lab';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface IProps {
  isLoading?: boolean;
}

const LabHead: FC<IProps> = ({ isLoading }) => {
  const { sort, setSort, search, setSearch } = useLabContext();

  return (
    <div className={styles.wrap}>
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

      <Filler />

      <div className={styles.search}>
        <SearchInput value={search} handler={setSearch} placeholder="Поиск" />
      </div>
    </div>
  );
};

export { LabHead };
