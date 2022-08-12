import { FC } from 'react';

import { Group } from '~/components/containers/Group';
import { Markdown } from '~/components/containers/Markdown';

export interface BorisSuperpowersProps {}

const BorisSuperpowers: FC<BorisSuperpowersProps> = () => {
  return (
    <Group>
      <h2>Штучки, находящиеся в разработке</h2>

      <Markdown>
        {`> На данный момент в разработке нет вещей, которые можно показать.\n\n// Приходите завтра`}
      </Markdown>
    </Group>
  );
};

export { BorisSuperpowers };
