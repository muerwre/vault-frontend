import React, { FC } from 'react';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';

interface IProps {}

const LoginSocialRegisterButtons: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Button stretchy>Зарегистрироваться</Button>
  </div>
);

export { LoginSocialRegisterButtons };
