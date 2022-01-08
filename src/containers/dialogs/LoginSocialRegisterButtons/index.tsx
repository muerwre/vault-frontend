import React, { FC } from 'react';
import { Button } from '~/components/input/Button';
import styles from './styles.module.scss';

interface IProps {}

const LoginSocialRegisterButtons: FC<IProps> = () => (
  <div className={styles.wrap}>
    <Button>Впустите меня!</Button>
  </div>
);

export { LoginSocialRegisterButtons };
