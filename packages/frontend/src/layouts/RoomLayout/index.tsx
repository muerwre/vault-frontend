import { FC } from 'react';

import { observer } from 'mobx-react-lite';

import { Anchor } from '~/components/common/Anchor';
import { Container } from '~/components/common/Container';
import { Button } from '~/components/input/Button';
import { Role } from '~/constants/auth';
import { NODE_TYPES } from '~/constants/node';
import { useAuth } from '~/hooks/auth/useAuth';
import { useStartNodeSubmission } from '~/hooks/node/useStartNodeSubmission';
import markdown from '~/styles/common/markdown.module.scss';

import styles from './styles.module.scss';
interface RoomLayoutProps {}

const RoomLayout: FC<RoomLayoutProps> = observer(() => {
  const startSubmission = useStartNodeSubmission();
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <div className={styles.room}>
        <Container>
          <div className={styles.info}>
            <div className={markdown.wrapper}>
              <h1>Рум</h1>

              <p>
                Пока ещё концепт, над которым я размышляю, ты видишь его, потому
                что включил суперсилы в <Anchor href="/boris">Борисе</Anchor>.
              </p>

              <p>
                Все идеи насчёт этого раздела можно посмотреть{' '}
                <a
                  href="https://github.com/muerwre/vault-frontend/issues/158"
                  target="_blank"
                  rel="noreferrer"
                >
                  на гитхабе
                </a>
                .
              </p>

              <p>
                Здесь, скорее всего, будет возможность добавить несколько песен
                и картинок для слайдшоу.
              </p>

              <p>
                Если помните einsam.ru или раздел Nowhere на старой версии
                сайта, то будет что-то такое.
              </p>

              {user.role === Role.Admin && (
                <p>
                  <br />

                  <Button
                    onClick={() => startSubmission(NODE_TYPES.ROOM, false)}
                  >
                    Добавить комнату
                  </Button>
                </p>
              )}
            </div>
          </div>
        </Container>
      </div>
      <div className={styles.items}></div>
    </div>
  );
});

export { RoomLayout };
