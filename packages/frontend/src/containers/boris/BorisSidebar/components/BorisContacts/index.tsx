import { FC } from 'react';

import { Padder } from '~/components/common/Padder';
import { Button } from '~/components/input/Button';

import { BorisContactItem } from './components/BorisContactItem';
import styles from './styles.module.scss';

interface Props {
  canConnectTelegram: boolean;
  connectTelegram: () => void;
}

const BorisContacts: FC<Props> = ({ canConnectTelegram, connectTelegram }) => (
  <div className={styles.contacts}>
    <BorisContactItem
      icon="vk"
      title="Суицидальные роботы"
      link="https://vk.com/vault48"
      subtitle="паблик вконтакте"
    />

    <BorisContactItem
      icon="github"
      title="Github"
      link="https://github.com/muerwre?tab=repositories&q=vault"
      subtitle="исходники Убежища"
    />

    <BorisContactItem
      icon="telegram"
      title="Телеграм-бот"
      link="https://t.me/vault48bot"
      subtitle="@vault48bot"
      suffix={
        canConnectTelegram && (
          <Padder>
            <Button onClick={connectTelegram}>Получать уведомления</Button>
          </Padder>
        )
      }
    />
  </div>
);

export { BorisContacts };
