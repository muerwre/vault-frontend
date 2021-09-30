import React, { FC, useEffect } from 'react';
import styles from './styles.module.scss';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { useDispatch } from 'react-redux';
import { authLoadProfile } from '~/redux/auth/actions';
import { useShallowSelect } from '~/utils/hooks/useShallowSelect';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { ProfilePageLeft } from '~/containers/profile/ProfilePageLeft';
import { Container } from '~/containers/main/Container';

type Props = RouteComponentProps<{ username: string }> & {};

const ProfileLayout: FC<Props> = ({
  match: {
    params: { username },
  },
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authLoadProfile(username));
  }, [username]);

  const profile = useShallowSelect(selectAuthProfile);

  return (
    <Container className={styles.wrap}>
      <ProfilePageLeft profile={profile} username={username} />
    </Container>
  );
};

export { ProfileLayout };
