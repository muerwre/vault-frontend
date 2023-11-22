import { FC } from 'react';

import { Grid } from '~/components/common/Grid';
import { Group } from '~/components/common/Group';
import { Button } from '~/components/input/Button';
import { OAuthProvider } from '~/types/auth';

import styles from './styles.module.scss';

interface Props {
  openOauthWindow: (provider: OAuthProvider) => void;
}

const LoginDialogButtons: FC<Props> = ({ openOauthWindow }) => (
  <Group className={styles.footer}>
    <Button>Войти</Button>

    <Grid columns="repeat(2, 1fr)">
      <Button
        color="outline"
        iconLeft="google"
        type="button"
        onClick={() => openOauthWindow('google')}
      >
        <span>Google</span>
      </Button>

      <Button
        color="outline"
        iconLeft="vk"
        type="button"
        onClick={() => openOauthWindow('vkontakte')}
      >
        <span>Вконтакте</span>
      </Button>
    </Grid>
  </Group>
);

export { LoginDialogButtons };
