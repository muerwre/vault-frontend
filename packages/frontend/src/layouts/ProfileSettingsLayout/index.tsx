import { FC, PropsWithChildren } from 'react';

import { ArrowLeftIcon } from 'lucide-react';

import { Card } from '~/components/common/Card';
import { Container } from '~/components/common/Container';
import { Filler } from '~/components/common/Filler';
import { Button } from '~/components/input/Button';
import { URLS } from '~/constants/urls';
import { UserSettingsView } from '~/containers/settings/UserSettingsView';
import { useUser } from '~/hooks/auth/useUser';
import { useNavigation } from '~/hooks/navigation/useNavigation';
import { usePageCover } from '~/utils/providers/PageCoverProvider';
import {
  SettingsProvider,
  useSettings,
} from '~/utils/providers/SettingsProvider';

import styles from './styles.module.scss';

const Form: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  const { handleSubmit } = useSettings();

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

interface Props {
  username: string;
}

/**
 * The settings from the settings sidebar, as a page of their own: the same
 * form and fields, laid out in two columns across the page, over the
 * user's cover.
 * Cancelling leads to the user's profile.
 */
const ProfileSettingsLayout: FC<Props> = ({ username }) => {
  const { push } = useNavigation();
  const { user } = useUser();

  usePageCover(user.cover);

  return (
    <Container className={styles.wrap}>
      <Card seamless>
        <SettingsProvider
          onSaved={(saved) => push(URLS.PROFILE_PAGE(saved.username))}
        >
          <Form>
            <Card.Row className={styles.header}>
              <Button
                type="button"
                color="link"
                iconLeft={<ArrowLeftIcon size={20} />}
                onClick={() => push(URLS.PROFILE_PAGE(username))}
              >
                Профиль
              </Button>
            </Card.Row>

            <UserSettingsView />

            <Card.Row className={styles.buttons}>
              <Filler />

              <Button
                type="button"
                color="link"
                onClick={() => push(URLS.PROFILE_PAGE(username))}
              >
                Отмена
              </Button>

              <Button type="submit">Сохранить</Button>
            </Card.Row>
          </Form>
        </SettingsProvider>
      </Card>
    </Container>
  );
};

export { ProfileSettingsLayout };
