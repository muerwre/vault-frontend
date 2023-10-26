import { FC } from 'react';

import { Card } from '~/components/containers/Card';
import { Group } from '~/components/containers/Group';
import { Markdown } from '~/components/containers/Markdown';

export interface BorisSuperpowersProps {}

const BorisSuperpowers: FC<BorisSuperpowersProps> = () => {
  return (
    <Card elevation={0}>
      <Group>
        <h3>Сейчас в разработке</h3>

        <Markdown>
          - Раздел [рум](/room) в начальной стадии, смотрю как будет работать
          концепт. Суть идеи можно посмотреть на
          [гитхабе](https://github.com/muerwre/vault-frontend/issues/158).
          Предложения можно оставлять здесь.
        </Markdown>
      </Group>
    </Card>
  );
};

export { BorisSuperpowers };
