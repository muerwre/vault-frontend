import React, { FC, useEffect } from 'react';
import styles from './styles.scss';
import { ProfilePageLeft } from '../ProfilePageLeft';
import { Switch, Route, RouteComponentProps } from 'react-router';
import { IState } from '~/redux/store';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { connect } from 'react-redux';
import * as AUTH_ACTIONS from '~/redux/auth/actions';

const mapStateToProps = (state: IState) => ({
  profile: selectAuthProfile(state),
});

const mapDispatchToProps = {
  authLoadProfile: AUTH_ACTIONS.authLoadProfile,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{ username: string }> & {};

const ProfilePageUnconnected: FC<Props> = ({
  profile,
  authLoadProfile,
  match: {
    params: { username },
  },
}) => {
  useEffect(() => {
    authLoadProfile(username);
  }, [username]);

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <ProfilePageLeft profile={profile} username={username} />
      </div>
      <div className={styles.right}>
        <Switch>
          <Route path="/profile/:username" render={() => <div>DEFAULT</div>} />
          <Route path="/profile/:username/tab" render={() => <div>TAB</div>} />
        </Switch>
      </div>
    </div>
  );
};

const ProfilePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfilePageUnconnected);

export { ProfilePage };
