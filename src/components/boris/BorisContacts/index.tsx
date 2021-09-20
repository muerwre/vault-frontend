import React, { FC } from 'react';
import { BorisContactItem } from '~/components/boris/BorisContactItem';
import styles from './styles.module.scss';

interface Props {}

const BorisContacts: FC<Props> = () => (
  <div className={styles.contacts}>
    <div className={styles.contacts__title}>Где мы ещё:</div>

    <BorisContactItem
      icon="vk"
      title="Суицидальные роботы"
      link="https://vk.com/vault48"
      subtitle="паблик вконтакте"
    />

    <BorisContactItem
      icon="telegram"
      title="Boris[48]bot"
      link="https://t.me/boris48bot"
      subtitle="телеграм-бот"
    />
  </div>
);

export { BorisContacts };
