import { FC } from 'react';

import { Anchor } from '~/components/common/Anchor';
import { Card } from '~/components/common/Card';
import { Group } from '~/components/common/Group';
import markdown from '~/styles/common/markdown.module.scss';

export interface BorisSuperpowersProps {}

const BorisSuperpowers: FC<BorisSuperpowersProps> = () => {
  return (
    <Card elevation={0}>
      <Group>
        <h3>Сейчас в разработке</h3>

        <div className={markdown.wrapper}>
          <ul>
            <li>
              Раздел <Anchor href="/room">рум</Anchor> в начальной стадии,
              смотрю как будет работать концепт. Суть идеи можно посмотреть на{' '}
              <Anchor href="https://github.com/muerwre/vault-frontend/issues/158">
                гитхабе
              </Anchor>
              . Предложения можно оставлять здесь.
            </li>
            <li>
              Раздел <Anchor href="/welcome">&laquo;где я?&raquo;</Anchor>,
              немного рассказывающий историю и мифологию Убежища. Ждёт текстов и
              иллюстраций.
            </li>
          </ul>
        </div>
      </Group>
    </Card>
  );
};

export { BorisSuperpowers };
