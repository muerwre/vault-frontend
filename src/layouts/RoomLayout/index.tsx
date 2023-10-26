import React, { FC } from 'react';

import { Container } from '~/containers/main/Container';
import markdown from '~/styles/common/markdown.module.scss';

import styles from './styles.module.scss';
interface RoomLayoutProps {}

const RoomLayout: FC<RoomLayoutProps> = () => (
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
              Здесь, скорее всего, будет возможность добавить несколько песен и
              картинок для слайдшоу.
            </p>

            <p>
              Если помните einsam.ru или раздел Nowhere на старой версии сайта,
              то будет что-то такое.
            </p>
          </div>
        </div>
      </Container>
    </div>
    <div className={styles.items}></div>
  </div>
);

export { RoomLayout };
