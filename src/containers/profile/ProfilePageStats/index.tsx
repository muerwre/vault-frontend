import React, { FC } from "react";
import styles from "./styles.module.scss";
import { StatsRow } from "~/components/common/StatsRow";
import { SubTitle } from "~/components/common/SubTitle";

interface Props {}

const Row: FC<{ count: number; title: string; icon?: string }> = ({ count, title, icon }) => (
  <div className={styles.row}>
    <div className={styles.title}>{title}</div>
    <div className={styles.counter}>{count > 999 ? '999+' : count}</div>
  </div>
);

const ProfilePageStats: FC<Props> = () => (
  <div className={styles.wrap}>
    <SubTitle>Ачивментс</SubTitle>

    <ul>
      <StatsRow isLoading={false} label="лет в бункере">
        9
      </StatsRow>
      <StatsRow isLoading={false} label="постов">
        99
      </StatsRow>
      <StatsRow isLoading={false} label="комментариев">
        999+
      </StatsRow>
      <StatsRow isLoading={false} label="лайков">
        99
      </StatsRow>
    </ul>
  </div>
);

export { ProfilePageStats };
