import React, { FC } from "react";
import styles from "./styles.module.scss";
import { Group } from "~/components/containers/Group";
import { Placeholder } from "~/components/placeholders/Placeholder";
import { getPrettyDate } from "~/utils/dom";
import { ProfileTabs } from "../ProfileTabs";
import { ProfileAvatar } from "~/components/profile/ProfileAvatar";
import { useProfileContext } from "~/utils/providers/ProfileProvider";

interface IProps {
  isLoading?: boolean;
  isOwn: boolean;
}

const ProfileInfo: FC<IProps> = ({ isOwn }) => {
  const { updatePhoto, profile, isLoading } = useProfileContext();

  return (
    <div>
      <Group className={styles.wrap} horizontal>
        <ProfileAvatar canEdit={isOwn} onChangePhoto={updatePhoto} photo={profile.photo} />

        <div className={styles.field}>
          <div className={styles.name}>
            {isLoading ? <Placeholder width="80%" /> : profile?.fullname || profile?.username}
          </div>

          <div className={styles.description}>
            {isLoading ? <Placeholder /> : getPrettyDate(profile?.last_seen)}
          </div>
        </div>
      </Group>

      <ProfileTabs is_own={isOwn} />
    </div>
  );
};

export { ProfileInfo };
