import React, { FC, MouseEventHandler } from 'react';
import { Button } from '~/components/input/Button';
import { Grid } from '~/components/containers/Grid';
import { Group } from '~/components/containers/Group';
import styles from './styles.module.scss';

interface IProps {
  openOauthWindow: (provider: string) => MouseEventHandler;
}

const LoginDialogButtons: FC<IProps> = ({ openOauthWindow }) => (
  <Group className={styles.footer}>
    <Button>
      <span>Войти</span>
    </Button>

    <Grid columns="repeat(2, 1fr)">
      <Button color="outline" iconLeft="google" type="button" onClick={openOauthWindow('google')}>
        <span>Google</span>
      </Button>

      <Button color="outline" iconLeft="vk" type="button" onClick={openOauthWindow('vkontakte')}>
        <span>Вконтакте</span>
      </Button>
    </Grid>
  </Group>
);

export { LoginDialogButtons };
