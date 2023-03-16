import { FC } from 'react';

import { Padder } from '~/components/containers/Padder';
import { NotificationSettingsForm } from '~/components/notifications/NotificationSettingsForm';
import { useOAuth } from '~/hooks/auth/useOAuth';
import { useNotificationSettings } from '~/hooks/notifications/useNotificationSettings';

interface NotificationSettingsProps {}

const NotificationSettings: FC<NotificationSettingsProps> = () => {
  const { settings, update } = useNotificationSettings();
  const { hasTelegram, showTelegramModal } = useOAuth();

  if (!settings) {
    return <>{null}</>;
  }

  return (
    <Padder>
      <NotificationSettingsForm
        value={settings}
        onSubmit={update}
        telegramConnected={hasTelegram}
        onConnectTelegram={showTelegramModal}
      />
    </Padder>
  );
};

export { NotificationSettings };
