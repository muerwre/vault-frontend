import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { authLoadProfile } from '~/redux/auth/actions';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthProfile, selectUser } from '~/redux/auth/selectors';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { Container } from '~/containers/main/Container';
import { FlowGrid } from '~/components/flow/FlowGrid';
import { FlowLayout } from '~/layouts/FlowLayout';
import { Sticky } from '~/components/containers/Sticky';
import { selectFlow } from '~/redux/flow/selectors';
import { ProfilePageStats } from '~/containers/profile/ProfilePageStats';

type Props = RouteComponentProps<{ username: string }> & {};

const ProfileLayout: FC<Props> = ({
  match: {
    params: { username },
  },
}) => {
  const { nodes } = useShallowSelect(selectFlow);
  const user = useShallowSelect(selectUser);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authLoadProfile(username));
  }, [username]);

  const profile = useShallowSelect(selectAuthProfile);

  return (
    <Container className={styles.wrap}>
      <div className={styles.left}>
        <Sticky>
          <div className={styles.row}>
            <ProfilePageLeft profile={profile} username={username} />
          </div>
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
};

export { ProfileLayout };
