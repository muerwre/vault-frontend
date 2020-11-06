import React, { FC, useCallback, useEffect, useState } from "react";
import styles from "./styles.module.scss";
import { connect } from "react-redux";
import { getURL } from "~/utils/dom";
import { pick } from "ramda";
import { selectAuthProfile, selectAuthUser } from "~/redux/auth/selectors";
import { PRESETS } from "~/constants/urls";
import { selectUploads } from "~/redux/uploads/selectors";
import { IFileWithUUID } from "~/redux/types";
import uuid from "uuid4";
import { UPLOAD_SUBJECTS, UPLOAD_TARGETS, UPLOAD_TYPES } from "~/redux/uploads/constants";
import { path } from 'ramda';
import * as UPLOAD_ACTIONS from "~/redux/uploads/actions";
import * as AUTH_ACTIONS from "~/redux/auth/actions";
import { Icon } from "~/components/input/Icon";

const mapStateToProps = state => ({
  user: pick(["id"], selectAuthUser(state)),
  profile: pick(["is_loading", "user"], selectAuthProfile(state)),
  uploads: pick(["statuses", "files"], selectUploads(state))
});

const mapDispatchToProps = {
  uploadUploadFiles: UPLOAD_ACTIONS.uploadUploadFiles,
  authPatchUser: AUTH_ACTIONS.authPatchUser
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {};

const ProfileAvatarUnconnected: FC<IProps> = ({
  user: { id },
  profile: { is_loading, user },
  uploads: { statuses, files },
  uploadUploadFiles,
  authPatchUser
}) => {
  const can_edit = !is_loading && id && id === user.id;

  const [temp, setTemp] = useState<string>(null);

  useEffect(() => {
    if (!can_edit) return;

    Object.entries(statuses).forEach(([id, status]) => {
      if (temp === id && !!status.uuid && files[status.uuid]) {
        authPatchUser({ photo: files[status.uuid] });
        setTemp(null);
      }
    });
  }, [statuses, files, temp, can_edit, authPatchUser]);

  const onUpload = useCallback(
    (uploads: File[]) => {
      const items: IFileWithUUID[] = Array.from(uploads).map(
        (file: File): IFileWithUUID => ({
          file,
          temp_id: uuid(),
          subject: UPLOAD_SUBJECTS.AVATAR,
          target: UPLOAD_TARGETS.PROFILES,
          type: UPLOAD_TYPES.IMAGE
        })
      );

      setTemp(path([0, "temp_id"], items));
      uploadUploadFiles(items.slice(0, 1));
    },
    [uploadUploadFiles, setTemp]
  );

  const onInputChange = useCallback(
    event => {
      if (!can_edit) return;

      event.preventDefault();

      if (!event.target.files || !event.target.files.length) return;

      onUpload(Array.from(event.target.files));
    },
    [onUpload, can_edit]
  );

  return (
    <div
      className={styles.avatar}
      style={{
        backgroundImage: is_loading
          ? null
          : `url("${user && getURL(user.photo, PRESETS.avatar)}")`
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
};

const ProfileAvatar = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProfileAvatarUnconnected);

export { ProfileAvatar };
