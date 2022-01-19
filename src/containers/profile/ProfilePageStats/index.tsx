import React, { FC } from 'react';

import { StatsRow } from '~/components/common/StatsRow';
import { SubTitle } from '~/components/common/SubTitle';

import styles from './styles.module.scss';

interface Props {}

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
