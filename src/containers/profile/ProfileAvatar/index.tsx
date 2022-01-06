import React, { ChangeEvent, FC, useCallback } from 'react';
import styles from './styles.module.scss';
import { connect } from 'react-redux';
import { getURL } from '~/utils/dom';
import { pick } from 'ramda';
import { selectAuthProfile, selectAuthUser } from '~/redux/auth/selectors';
import { PRESETS } from '~/constants/urls';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import * as AUTH_ACTIONS from '~/redux/auth/actions';
import { Icon } from '~/components/input/Icon';
import { useUploader } from '~/hooks/data/useUploader';
import { observer } from 'mobx-react-lite';
import { showErrorToast } from '~/utils/errors/showToast';

const mapStateToProps = state => ({
  user: pick(['id'], selectAuthUser(state)),
  profile: pick(['is_loading', 'user'], selectAuthProfile(state)),
});

const mapDispatchToProps = {
  authPatchUser: AUTH_ACTIONS.authPatchUser,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & {};

const ProfileAvatarUnconnected: FC<IProps> = observer(
  ({ user: { id }, profile: { is_loading, user }, authPatchUser }) => {
    const uploader = useUploader(
      UploadSubject.Avatar,
      UploadTarget.Profiles,
      user?.photo ? [] : []
    );

    const onInputChange = useCallback(
      async (event: ChangeEvent<HTMLInputElement>) => {
        try {
          if (!event.target.files?.length) {
            return;
          }

          const photo = await uploader.uploadFile(event.target.files[0]);
          authPatchUser({ photo });
        } catch (error) {
          showErrorToast(error);
        }
      },
      [uploader, authPatchUser]
    );

    const can_edit = !is_loading && id && id === user?.id;

    const backgroundImage = is_loading
      ? undefined
      : `url("${user && getURL(user.photo, PRESETS.avatar)}")`;

    return (
      <div
        className={styles.avatar}
        style={{
          backgroundImage,
        }}
      >
        {can_edit && <input type="file" onInput={onInputChange} />}
        {can_edit && (
          <div className={styles.can_edit}>
            <Icon icon="photo_add" />
          </div>
        )}
      </div>
    );
  }
);

const ProfileAvatar = connect(mapStateToProps, mapDispatchToProps)(ProfileAvatarUnconnected);

export { ProfileAvatar };
