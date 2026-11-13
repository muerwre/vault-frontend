import { FC } from 'react';

import { Button } from '~/components/input/Button';

import styles from './styles.module.scss';

interface Props {}

const LoginSocialRegisterButtons: FC<Props> = () => (
  <div className={styles.wrap}>
    <Button>Впустите меня!</Button>
  </div>
);

export { LoginSocialRegisterButtons };
