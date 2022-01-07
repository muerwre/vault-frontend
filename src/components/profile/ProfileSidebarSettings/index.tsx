import React, { FC } from "react";
import { ProfileSettings } from "~/components/profile/ProfileSettings";
import styles from "./styles.module.scss";
import { Filler } from "~/components/containers/Filler";
import { Button } from "~/components/input/Button";

interface IProps {}

const ProfileSidebarSettings: FC<IProps> = () => (
  <div className={styles.wrap}>
    <div className={styles.scroller}>
      <ProfileSettings />
    </div>
    <div className={styles.buttons}>
      <Filler />
      <Button color="outline">Отмена</Button>
      <Button>Сохранить</Button>
    </div>
  </div>
);

export { ProfileSidebarSettings };
