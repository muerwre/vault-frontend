import { FC } from 'react';

import { Filler } from '~/components/common/Filler';
import { Group } from '~/components/common/Group';
import { Padder } from '~/components/common/Padder';
import { Button } from '~/components/input/Button';
import { UserSettingsView } from '~/containers/settings/UserSettingsView';
import {
  SettingsProvider,
  useSettings,
} from '~/utils/providers/SettingsProvider';

const Form = ({ children }) => {
  const { handleSubmit } = useSettings();

  return <form onSubmit={handleSubmit}>{children}</form>;
};

const ProfileSettings: FC = () => {
  return (
    <SettingsProvider>
      <Form>
        <Padder>
          <Group>
            <UserSettingsView />

            <Group horizontal>
              <Filler />
              <Button title="Сохранить" type="submit" />
            </Group>
          </Group>
        </Padder>
      </Form>
    </SettingsProvider>
  );
};

export { ProfileSettings };
