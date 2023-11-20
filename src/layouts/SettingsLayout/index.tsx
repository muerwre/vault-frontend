import { FC } from 'react';

import { Card } from '~/components/common/Card';
import { Sticky } from '~/components/common/Sticky';
import { SettingsMenu } from '~/components/settings/SettingsMenu';
import { Container } from '~/containers/main/Container';

import styles from './styles.module.scss';

interface SettingsLayoutProps {}

const SettingsLayout: FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <Container className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.menu}>
          <Sticky>
            <SettingsMenu />
          </Sticky>
        </div>

        <div className={styles.content}>{children}</div>
      </Card>
    </Container>
  );
};

export { SettingsLayout };
