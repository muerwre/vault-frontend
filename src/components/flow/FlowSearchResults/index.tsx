import React, { FC } from "react";
import styles from "./styles.module.scss";
import { FlowRecentItem } from "../FlowRecentItem";
import { Icon } from "~/components/input/Icon";
import { INode } from "~/redux/types";
import { InfiniteScroll } from "~/components/containers/InfiniteScroll";

interface IProps {
  isLoading: boolean;
  results: INode[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const FlowSearchResults: FC<IProps> = ({ results, isLoading, onLoadMore, hasMore }) => {
  if (!results.length) {
    return (
      <div className={styles.loading}>
        <Icon size={96} icon="search" />
        <div className={styles.nothing}>Ничего не найдено</div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <InfiniteScroll hasMore={hasMore} loadMore={onLoadMore}>
        {results.map(node => (
          <FlowRecentItem node={node} key={node.id} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export { FlowSearchResults };
