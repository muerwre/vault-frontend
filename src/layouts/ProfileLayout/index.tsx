import React, { FC } from 'react';

import { observer } from 'mobx-react-lite';
import { RouteComponentProps } from 'react-router';

import { Card } from '~/components/containers/Card';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { Container } from '~/containers/main/Container';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { ProfilePageStats } from '~/containers/profile/ProfilePageStats';
import { useUser } from '~/hooks/auth/useUser';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { useFlowStore } from '~/store/flow/useFlowStore';

import styles from './styles.module.scss';

type Props = RouteComponentProps<{ username: string }> & {};

const ProfileLayout: FC<Props> = observer(
  ({
    match: {
      params: { username },
    },
  }) => {
    const { nodes } = useFlowStore();
    const { user } = useUser();
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
