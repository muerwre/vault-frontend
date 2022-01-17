import React, { FC, useState } from 'react';
import { Card } from '~/components/containers/Card';
import styles from './styles.module.scss';
import markdown from '~/styles/common/markdown.module.scss';
import { Group } from '~/components/containers/Group';
import { Button } from '~/components/input/Button';
import { InputText } from '~/components/input/InputText';
import { useShowModal } from '~/hooks/modal/useShowModal';
import { Dialog } from '~/constants/modal';

interface IProps {}

const BorisUIDemo: FC<IProps> = () => {
  const [text, setText] = useState('');
  const openProfileSidebar = useShowModal(Dialog.ProfileSidebar);

  return (
    <Card className={styles.card}>
      <div className={markdown.wrapper}>
        <h1>UI</h1>
        <p>
          Простая демонстрация элементов интерфейса. Используется, в основном, как подсказка при
          разработке
        </p>

        <h2>Тестовые фичи</h2>
        <Button onClick={() => openProfileSidebar({})}>Профиль в сайдбаре</Button>

        <h2>Инпуты</h2>

        <form autoComplete="off">
          <Group>
            <InputText title="Обычный инпут" handler={setText} value={text} />
            <InputText title="Инпут с ошибкой" error="Ошибка" handler={setText} value={text} />
            <InputText title="Пароль" type="password" handler={setText} value={text} />
          </Group>
        </form>

        <h2>Кнопки</h2>

        <h4>Цвета</h4>

        <Group horizontal className={styles.sample}>
          <Button>Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="outline">Outline</Button>
          <Button color="gray">Gray</Button>
          <Button color="link">Link</Button>
        </Group>

        <h4>Размеры</h4>

        <Group horizontal className={styles.sample}>
          <Button size="micro">Micro</Button>
          <Button size="mini">Mini</Button>
          <Button size="normal">Normal</Button>
          <Button size="big">Big</Button>
          <Button size="giant">Giant</Button>
        </Group>

        <h4>Варианты</h4>
        <Group horizontal className={styles.sample}>
          <Button iconRight="check">iconRight</Button>
          <Button iconLeft="send">iconLeft</Button>
          <Button round>Round</Button>
        </Group>
      </div>
    </Card>
  );
};

export { BorisUIDemo };
