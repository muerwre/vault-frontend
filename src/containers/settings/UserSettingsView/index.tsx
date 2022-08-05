import { FC } from "react";

import { Superpower } from "~/components/boris/Superpower";
import { Filler } from "~/components/containers/Filler";
import { Group } from "~/components/containers/Group";
import { Zone } from "~/components/containers/Zone";
import { InputText } from "~/components/input/InputText";
import { Textarea } from "~/components/input/Textarea";
import { ERROR_LITERAL } from "~/constants/errors";
import { ProfileAccounts } from "~/containers/profile/ProfileAccounts";
import { useWindowSize } from "~/hooks/dom/useWindowSize";
import { useSettings } from "~/utils/providers/SettingsProvider";
import { has } from "~/utils/ramda";

import styles from "./styles.module.scss";

interface UserSettingsViewProps {}

const getError = (error?: string) =>
  error && has(error, ERROR_LITERAL) ? error : undefined;

const UserSettingsView: FC<UserSettingsViewProps> = () => {
  const { values, handleChange, errors } = useSettings();
  const { isPhone } = useWindowSize();

  return (
    <Group>
      <Group horizontal={!isPhone} className={styles.base_info}>
        <Superpower>
          <Zone className={styles.avatar} title="Фото">
            <small>
              Будет здесь. Кстати, ты видишь это, потому что включил суперсилы в
              Борисе.
            </small>
          </Zone>
        </Superpower>

        <Zone title="О себе" className={styles.about}>
          <Group>
            <InputText
              value={values.fullname}
              handler={handleChange("fullname")}
              title="Полное имя"
              error={getError(errors.fullname)}
            />

            <Textarea
              value={values.description}
              handler={handleChange("description")}
              title="Описание"
            />

            <div className={styles.small}>
              Описание будет показываться при клике наведении на вашу аватарку.
            </div>
          </Group>
        </Zone>
      </Group>

      <Superpower>
        <Zone title="Обложка">
          <small>
            Будет здесь. Кстати, ты видишь это, потому что включил суперсилы в
            Борисе.
          </small>
          <br />
          <br />
          <br />
          <br />
          <br />
        </Zone>
      </Superpower>

      <Filler />

      <Zone color="danger" title="Логин и пароли">
        <Group>
          <InputText
            value={values.username}
            handler={handleChange("username")}
            title="Логин"
            error={getError(errors.username)}
          />

          <InputText
            value={values.email}
            handler={handleChange("email")}
            title="E-mail"
            error={getError(errors.email)}
          />

          <InputText
            value={values.newPassword}
            handler={handleChange("newPassword")}
            title="Новый пароль"
            type="password"
            error={getError(errors.newPassword)}
          />

          <InputText
            value={values.password}
            handler={handleChange("password")}
            title="Старый пароль"
            type="password"
            error={getError(errors.password)}
          />

          <div className={styles.small}>
            Чтобы изменить любое из этих полей, нужно ввести старый пароль.
          </div>
        </Group>
      </Zone>

      <Filler />

      <Filler />

      <Zone className={styles.pad} title="Аккаунты">
        <ProfileAccounts />
      </Zone>

      <Superpower>
        <Zone title="Всякие приятные штуковины">
          <small>
            Будут здесь. Кстати, ты видишь это, потому что включил суперсилы в
            Борисе.
          </small>
          <br />
        </Zone>
      </Superpower>
    </Group>
  );
};

export { UserSettingsView };
