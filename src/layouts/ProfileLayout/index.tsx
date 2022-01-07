import React, { FC, useEffect } from "react";
import styles from "./styles.module.scss";
import { RouteComponentProps } from "react-router";
import { useDispatch } from "react-redux";
import { authLoadProfile } from "~/redux/auth/actions";
import { useShallowSelect } from "~/hooks/data/useShallowSelect";
import { selectAuthProfile, selectUser } from "~/redux/auth/selectors";
import { ProfilePageLeft } from "~/containers/profile/ProfilePageLeft";
import { Container } from "~/containers/main/Container";
import { FlowGrid } from "~/components/flow/FlowGrid";
import { Sticky } from "~/components/containers/Sticky";
import { ProfilePageStats } from "~/containers/profile/ProfilePageStats";
import { Card } from "~/components/containers/Card";
import { useFlowStore } from "~/store/flow/useFlowStore";
import { observer } from "mobx-react";

type Props = RouteComponentProps<{ username: string }> & {};

const ProfileLayout: FC<Props> = observer(
  ({
    match: {
      params: { username },
    },
  }) => {
    const { nodes } = useFlowStore();
    const user = useShallowSelect(selectUser);

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(authLoadProfile(username));
    }, [dispatch, username]);

    const profile = useShallowSelect(selectAuthProfile);

    return (
      <Container className={styles.wrap}>
        <div className={styles.left}>
          <Sticky>
            <div className={styles.row}>
              <ProfilePageLeft profile={profile} username={username} />
            </div>

            {!!profile.user?.description && (
              <div className={styles.row}>
                <Card className={styles.description}>{profile.user.description}</Card>
              </div>
            )}

            <div className={styles.row}>
              <ProfilePageStats />
            </div>
          </Sticky>
        </div>

        <div className={styles.grid}>
          <FlowGrid nodes={nodes} user={user} onChangeCellView={console.log} />
        </div>
      </Container>
    );
  }
);

export { ProfileLayout };
