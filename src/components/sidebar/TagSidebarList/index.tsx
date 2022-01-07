import React, { FC } from "react";
import { INode } from "~/redux/types";
import styles from "./styles.module.scss";
import { FlowRecentItem } from "~/components/flow/FlowRecentItem";

interface IProps {
  nodes: INode[];
}

const TagSidebarList: FC<IProps> = ({ nodes }) => (
  <div className={styles.list}>
    {nodes.map(node => (
      <FlowRecentItem node={node} key={node.id} />
    ))}
  </div>
);

export { TagSidebarList };
