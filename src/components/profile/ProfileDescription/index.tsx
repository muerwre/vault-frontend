import React, { FC } from 'react';
import { IUser } from '~/redux/auth/types';
import { formatText } from '~/utils/dom';
import styles from './styles.scss';
import { connect } from 'react-redux';
import { selectAuthProfile } from '~/redux/auth/selectors';
import { ProfileLoader } from '~/containers/profile/ProfileLoader';

const mapStateToProps = state => ({
  profile: selectAuthProfile(state),
});

type IProps = ReturnType<typeof mapStateToProps> & {};

const ProfileDescriptionUnconnected: FC<IProps> = ({ profile: { user, is_loading } }) => {
  if (is_loading) return <ProfileLoader />;

  return (
    <div className={styles.wrap}>
      {user.description && <div className={styles.content}>{formatText(user.description)}</div>}
      {!user.description && (
        <div className={styles.placeholder}>
          {user.fullname || user.username} пока ничего не рассказал о себе
        </div>
      )}
    </div>
  );
};

const ProfileDescription = connect(mapStateToProps)(ProfileDescriptionUnconnected);

export { ProfileDescription };
