import React, { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { LabHeadItem } from '~/components/lab/LabHeadItem';
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
      <div className={styles.group}>
        <LabHeadItem
          icon="recent"
          active={sort === LabNodesSort.New}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.New)}
        >
          Свежие
        </LabHeadItem>

        <LabHeadItem
          icon="hot"
          active={sort === LabNodesSort.Hot}
          isLoading={isLoading}
          onClick={() => setSort(LabNodesSort.Hot)}
        >
          Популярные
        </LabHeadItem>
      </div>
    </Group>
  );
};

export { LabHead };
