import React, { FC } from "react";
import styles from "./styles.module.scss";
import { RouteComponentProps } from "react-router";
import { useShallowSelect } from "~/hooks/data/useShallowSelect";
import { selectUser } from "~/redux/auth/selectors";
import { ProfilePageLeft } from "~/containers/profile/ProfilePageLeft";
import { Container } from "~/containers/main/Container";
import { FlowGrid } from "~/components/flow/FlowGrid";
import { ProfilePageStats } from "~/containers/profile/ProfilePageStats";
import { Card } from "~/components/containers/Card";
import { useFlowStore } from "~/store/flow/useFlowStore";
import { observer } from "mobx-react";
import { useGetProfile } from "~/hooks/profile/useGetProfile";

type Props = RouteComponentProps<{ username: string }> & {};

const ProfileLayout: FC<Props> = observer(
  ({
    match: {
      params: { username },
    },
  }) => {
    const { nodes } = useFlowStore();
    const user = useShallowSelect(selectUser);
    const { profile, isLoading } = useGetProfile(username);

    return (
      <Container className={styles.wrap}>
        <div className={styles.grid}>
          <div className={styles.stamp}>
            <div className={styles.row}>
              <ProfilePageLeft profile={profile} username={username} isLoading={isLoading} />
            </div>

            {!!profile?.description && (
              <div className={styles.row}>
                <Card className={styles.description}>{profile.description}</Card>
              </div>
            )}

            <div className={styles.row}>
              <ProfilePageStats />
            </div>
          </div>

          <FlowGrid nodes={nodes} user={user} onChangeCellView={console.log} />
        </div>
      </Container>
    );
  }
);

export { ProfileLayout };
