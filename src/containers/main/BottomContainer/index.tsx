import React, { FC } from "react";
import styles from "./styles.module.scss";
import { PlayerView } from "~/containers/player/PlayerView";

type IProps = {};

const BottomContainer: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.content}>
      <div className={styles.padder}>
        <PlayerView />
      </div>
    </div>
  </div>
);

export { BottomContainer };
