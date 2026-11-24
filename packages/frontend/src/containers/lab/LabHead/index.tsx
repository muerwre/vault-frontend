import { FC } from 'react';

import { FlameIcon, RotateCcwClockIcon } from 'lucide-react';

import { Filler } from '~/components/common/Filler';
import { StarFilledIcon } from '~/components/icons';
import { SearchInput } from '~/components/input/SearchInput';
import { HorizontalMenu } from '~/components/menu/HorizontalMenu';
import { LabNodesSort } from '~/types/lab';
import { useLabContext } from '~/utils/context/LabContextProvider';

import styles from './styles.module.scss';

interface Props {
  isLoading?: boolean;
}

const LabHead: FC<Props> = ({ isLoading }) => {
  const { sort, setSort, search, setSearch } = useLabContext();

  return (
    <div className={styles.wrap}>
      <HorizontalMenu>
        <HorizontalMenu.Item
          color="green"
          icon={<RotateCcwClockIcon size={20} />}
          active={sort === LabNodesSort.New}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.New)}
        >
          Свежие
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="orange"
          icon={<FlameIcon size={20} />}
          active={sort === LabNodesSort.Hot}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.Hot)}
        >
          Популярные
        </HorizontalMenu.Item>

        <HorizontalMenu.Item
          color="yellow"
          icon={<StarFilledIcon size={20} />}
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
