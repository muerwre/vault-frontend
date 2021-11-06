import React, { FC } from 'react';
import { FlowGrid } from '~/components/flow/FlowGrid';
import styles from './styles.module.scss';
import { FlowStamp } from '~/components/flow/FlowStamp';
import { SidebarRouter } from '~/containers/main/SidebarRouter';
import { FlowDisplay, IFlowNode, INode } from '~/redux/types';
import classNames from 'classnames';
import { FlowSwiperHero } from '~/components/flow/FlowSwiperHero';
import { IUser } from '~/redux/auth/types';

interface Props {
  updates: IFlowNode[];
  recent: IFlowNode[];
  heroes: IFlowNode[];
  nodes: IFlowNode[];
  user: IUser;
  isFluid: boolean;
  onToggleLayout: () => void;
  onChangeCellView: (id: INode['id'], flow: FlowDisplay) => void;

  searchText: string;
  searchTotal: number;
  searchIsLoading: boolean;
  searchResults: INode[];
  onSearchChange: (text: string) => void;
  onSearchLoadMore: () => void;
}

const FlowLayout: FC<Props> = ({
  updates,
  heroes,
  recent,
  nodes,
  user,
  isFluid,
  onToggleLayout,
  onChangeCellView,

  searchText,
  searchTotal,
  searchIsLoading,
  searchResults,
  onSearchChange,
  onSearchLoadMore,
}) => {
  return (
    <div className={classNames(styles.container)}>
      <div className={styles.grid}>
        <div className={styles.hero}>
          <FlowSwiperHero heroes={heroes} />
        </div>

        <div className={styles.stamp}>
          <FlowStamp
            isFluid={isFluid}
            recent={recent}
            updated={updates}
            searchText={searchText}
            searchIsLoading={searchIsLoading}
            searchTotal={searchTotal}
            searchResults={searchResults}
            onSearchChange={onSearchChange}
            onSearchLoadMore={onSearchLoadMore}
            onToggleLayout={onToggleLayout}
          />
        </div>

        <FlowGrid nodes={nodes} user={user} onChangeCellView={onChangeCellView} />
      </div>

      <SidebarRouter prefix="" />
    </div>
  );
};

export { FlowLayout };
