import React, { FC, memo } from "react";
import styles from "./styles.module.scss";
import cell_style from "~/components/node/NodeRelatedItem/styles.module.scss";
import { Group } from "~/components/containers/Group";
import { Placeholder } from "~/components/placeholders/Placeholder";
import range from "ramda/es/range";
import classNames from "classnames";

interface IProps {}

const NodeRelatedPlaceholder: FC<IProps> = memo(() => {
  return (
    <Group className={classNames(styles.wrap, styles.placeholder)}>
      <div className={styles.title}>
        <div className={styles.line} />
        <div className={styles.text}>
          <Placeholder />
        </div>
        <div className={styles.line} />
      </div>

      <div className={styles.grid}>
        {range(0, 6).map(el => (
          <div className={cell_style.item} key={el} />
        ))}
      </div>
    </Group>
  );
});

export { NodeRelatedPlaceholder };
