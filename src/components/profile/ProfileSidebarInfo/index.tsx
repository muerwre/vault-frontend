import React, { FC } from "react";
import styles from "./styles.module.scss";
import { ProfileAvatar } from "~/containers/profile/ProfileAvatar";
import { Placeholder } from "~/components/placeholders/Placeholder";
import { getPrettyDate } from "~/utils/dom";
import { IUser } from "~/redux/auth/types";

interface IProps {
  is_loading: boolean;
  user: IUser;
}

const ProfileSidebarInfo: FC<IProps> = ({ is_loading, user }) => (
  <div className={styles.wrap}>
    <div className={styles.avatar}>
      <ProfileAvatar />
    </div>

    <div className={styles.field}>
      <div className={styles.name}>
        {is_loading ? <Placeholder width="80%" /> : user.fullname || user.username}
      </div>

      <div className={styles.description}>
        {is_loading ? <Placeholder /> : getPrettyDate(user.last_seen)}
      </div>
    </div>
  </div>
);

export { ProfileSidebarInfo };
