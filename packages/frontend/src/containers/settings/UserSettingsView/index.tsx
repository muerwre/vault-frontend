import { FC, useCallback } from 'react';

import {
  MAX_DESCRIPTION_LENGTH,
  MAX_FULLNAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PROFILE_INFO_ITEMS,
  MAX_PROFILE_INFO_TITLE_LENGTH,
  MAX_PROFILE_INFO_VALUE_LENGTH,
  MAX_USERNAME_LENGTH,
  PROFILE_NODES_VIEW,
} from '@vault/common/constants';

import { Card } from '~/components/common/Card';
import { Group } from '~/components/common/Group';
import { Zone } from '~/components/common/Zone';
import { InputText } from '~/components/input/InputText';
import { Textarea } from '~/components/input/Textarea';
import { ProfilePhotoEditor } from '~/components/profile/ProfilePhotoEditor';
import { SuperPowersToggle } from '~/containers/auth/SuperPowersToggle';
import { ProfileAccounts } from '~/containers/profile/ProfileAccounts';
import { ProfileCoverEditor } from '~/containers/profile/ProfileCoverEditor';
import { ProfileNodesViewSwitch } from '~/containers/profile/ProfileNodesViewSwitch';
import { ThemeSwitcher } from '~/containers/settings/ThemeSwitcher';
import { usePatchUser } from '~/hooks/auth/usePatchUser';
import { useUser } from '~/hooks/auth/useUser';
import { useWindowSize } from '~/hooks/dom/useWindowSize';
import { useSettings } from '~/utils/providers/SettingsProvider';

import styles from './styles.module.scss';

interface UserSettingsViewProps {}

const AVATAR_SIZE = 160;

type InfoItem = { title: string; value: string };

const isEmpty = (item: InfoItem) => !item.title && !item.value;

/**
 * The info as pairs of inputs: the entries there are, then a single empty
 * pair once every entry has a value, until the limit. Entries emptied while
 * editing stay, so typing is not thrown off; those without a value are
 * dropped on save.
 */
const toInfoInputs = (info: InfoItem[] = []): InfoItem[] => {
  const inputs = [...info];

  while (
    inputs.length > 1 &&
    isEmpty(inputs[inputs.length - 1]) &&
    isEmpty(inputs[inputs.length - 2])
  ) {
    inputs.pop();
  }

  if (
    inputs.length < MAX_PROFILE_INFO_ITEMS &&
    inputs.every((item) => item.value)
  ) {
    inputs.push({ title: '', value: '' });
  }

  return inputs;
};

const UserSettingsView: FC<UserSettingsViewProps> = () => {
  const { values, handleChange, errors, setFieldValue } = useSettings();
  const { isPhone } = useWindowSize();
  const { user } = useUser();
  const { updatePhoto, deletePhoto, save } = usePatchUser();

  const infoInputs = toInfoInputs(values.info);

  const setInfo = useCallback(
    (index: number, field: keyof InfoItem) => (text: string) =>
      setFieldValue(
        'info',
        toInfoInputs(
          infoInputs.map((it, i) =>
            i === index ? { ...it, [field]: text } : it,
          ),
        ),
      ),
    [infoInputs, setFieldValue],
  );

  return (
    <Card.Row columns>
      <Card.Column>
        <Group className={styles.zones}>
          <Group horizontal={!isPhone} className={styles.base_info}>
            <ProfilePhotoEditor
              photo={user.photo}
              size={AVATAR_SIZE}
              onUpload={updatePhoto}
              onDelete={deletePhoto}
            />

            <Zone title="О себе" className={styles.about}>
              <Group>
                <InputText
                  value={values.fullname}
                  handler={handleChange('fullname')}
                  title="Полное имя"
                  maxLength={MAX_FULLNAME_LENGTH}
                  error={errors.fullname}
                />

                <Textarea
                  value={values.description}
                  handler={handleChange('description')}
                  title="Описание"
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  error={errors.description}
                />

                <div className={styles.small}>
                  Описание будет показываться при клике наведении на вашу
                  аватарку.
                </div>
              </Group>
            </Zone>
          </Group>

          <Zone color="danger" title="Логин и пароли">
            <Group>
              <InputText
                value={values.username}
                handler={handleChange('username')}
                title="Логин"
                maxLength={MAX_USERNAME_LENGTH}
                error={errors.username}
              />

              {/* Password resets trust it, so it cannot be changed here. */}
              <InputText
                value={values.email}
                handler={() => {}}
                title="E-mail"
                error={errors.email}
                readOnly
                disabled
              />

              <InputText
                value={values.newPassword}
                handler={handleChange('newPassword')}
                title="Новый пароль"
                maxLength={MAX_PASSWORD_LENGTH}
                type="password"
                error={errors.newPassword}
              />

              <InputText
                value={values.password}
                handler={handleChange('password')}
                title="Старый пароль"
                maxLength={MAX_PASSWORD_LENGTH}
                type="password"
                error={errors.password}
              />

              <div className={styles.small}>
                Чтобы изменить любое из этих полей, нужно ввести старый пароль.
              </div>
            </Group>
          </Zone>

          <Zone className={styles.pad} title="Аккаунты">
            <ProfileAccounts />
          </Zone>
        </Group>
      </Card.Column>

      <Card.Column>
        <Group className={styles.zones}>
          <Zone title="Дополнительная информация">
            <Group>
              {infoInputs.map((item, index) => (
                <div key={index} className={styles.info_row}>
                  <InputText
                    value={item.title}
                    handler={setInfo(index, 'title')}
                    placeholder="Название"
                    maxLength={MAX_PROFILE_INFO_TITLE_LENGTH}
                    className={styles.info_title}
                  />

                  <InputText
                    value={item.value}
                    handler={setInfo(index, 'value')}
                    placeholder="Ссылка или что угодно"
                    maxLength={MAX_PROFILE_INFO_VALUE_LENGTH}
                    className={styles.info_value}
                  />
                </div>
              ))}

              {typeof errors.info === 'string' && (
                <div className={styles.error}>{errors.info}</div>
              )}

              <div className={styles.small}>
                Ссылки на соцсети и сайты или что угодно ещё о вас: город,
                любимую группу, телеграм. Ссылки станут кликабельными сами.
              </div>
            </Group>
          </Zone>

          {/* On phones the profile's floating bar has no view switch */}
          <Zone title="Вид профиля" className={styles.mobile_only}>
            <ProfileNodesViewSwitch
              value={user.nodes_view ?? PROFILE_NODES_VIEW.FLOW}
              onChange={(nodes_view) => void save({ nodes_view })}
              withTitles
            />
          </Zone>

          <Zone title="Тема оформления">
            <ThemeSwitcher />
          </Zone>

          <Zone title="Фон профиля">
            <ProfileCoverEditor />
          </Zone>

          <div className={styles.superpowers}>
            <SuperPowersToggle />
          </div>
        </Group>
      </Card.Column>
    </Card.Row>
  );
};

export { UserSettingsView };
