import React, { FC } from 'react';

import { Button } from '~/components/input/Button';
import { Role } from '~/constants/auth';
import { Dialog } from '~/constants/modal';
import { NODE_TYPES } from '~/constants/node';
import { Container } from '~/containers/main/Container';
import { useAuth } from '~/hooks/auth/useAuth';
import { useShowModal } from '~/hooks/modal/useShowModal';
import markdown from '~/styles/common/markdown.module.scss';

import styles from './styles.module.scss';
interface RoomLayoutProps {}

const RoomLayout: FC<RoomLayoutProps> = () => {
  const createNode = useShowModal(Dialog.CreateNode);
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
                что включил суперсилы в <a href="/boris">Борисе</a>.
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
                    onClick={() =>
                      createNode({ isInLab: false, type: NODE_TYPES.ROOM })
                    }
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
};

export { RoomLayout };
