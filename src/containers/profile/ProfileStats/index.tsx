import React, { VFC } from 'react';

import { Square } from '~/components/common/Square';
import { Card } from '~/components/containers/Card';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';

interface ProfileStatsProps {}

const ProfileStats: VFC<ProfileStatsProps> = () => (
  <Group>
    <Grid columns="2fr 1fr">
      <Card>
        <h4>1 год 2 месяца</h4>
        <small>в убежище</small>
      </Card>

      <Card>
        <Square>
          <h4>24 поста</h4>
          <small>Создано</small>
        </Square>
      </Card>
    </Grid>

    <Grid columns="1fr 2fr">
      <Card>
        <Square>
          <h4>16545 лайка</h4>
          <small>получено</small>
        </Square>
      </Card>

      <Card>
        <h4>123123 комментария</h4>
        <small>под постами</small>
      </Card>
    </Grid>
  </Group>
);

export { ProfileStats };
