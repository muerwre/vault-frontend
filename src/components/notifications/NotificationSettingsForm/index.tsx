import React, { FC, useCallback } from 'react';

import { Group } from '~/components/containers/Group';
import { Zone } from '~/components/containers/Zone';
import { Button } from '~/components/input/Button';
import { InputRow } from '~/components/input/InputRow';
import { Toggle } from '~/components/input/Toggle';
import { useNotificationSettingsForm } from '~/hooks/notifications/useNotificationSettingsForm';
import { NotificationSettings } from '~/types/notifications';

import styles from './styles.module.scss';

interface NotificationSettingsFormProps {
  value: NotificationSettings;
  onSubmit: (val: Partial<NotificationSettings>) => Promise<unknown>;
  telegramConnected: boolean;
  onConnectTelegram: () => void;
}

const NotificationSettingsForm: FC<NotificationSettingsFormProps> = ({
  value,
  onSubmit,
  telegramConnected,
  onConnectTelegram,
}) => {
  const { setFieldValue, values } = useNotificationSettingsForm(
    value,
    onSubmit,
  );

  const toggle = useCallback(
    (key: keyof NotificationSettings, disabled?: boolean) => (
      <Toggle
        handler={(val) => setFieldValue(key, val)}
        value={values[key]}
        disabled={disabled}
      />
    ),
    [setFieldValue, values],
  );

  const telegramInput = telegramConnected ? (
    toggle('sendTelegram', !values.enabled)
  ) : (
    <Button size="micro" onClick={onConnectTelegram}>
      Подключить
    </Button>
  );

  return (
    <Group>
      <Zone title="Уведомления">
        <Group>
          <InputRow className={styles.row} input={toggle('enabled')}>
            Включены
          </InputRow>
          <InputRow
            className={styles.row}
            input={toggle('flow', !values.enabled)}
          >
            Новые посты
          </InputRow>

          <InputRow
            className={styles.row}
            input={toggle('comments', !values.enabled)}
          >
            Комментарии
          </InputRow>
        </Group>
      </Zone>

      <Zone title="Уведомления">
        <Group>
          <InputRow
            className={styles.row}
            input={toggle('showIndicator', !values.enabled)}
          >
            На иконке профиля
          </InputRow>

          <InputRow className={styles.row} input={telegramInput}>
            Телеграм
          </InputRow>
        </Group>
      </Zone>
    </Group>
  );
};

export { NotificationSettingsForm };
