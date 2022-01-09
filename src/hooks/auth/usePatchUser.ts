import { useUploader } from '~/hooks/data/useUploader';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { useCallback } from 'react';
import { showErrorToast } from '~/utils/errors/showToast';
import { apiUpdateUser } from '~/api/auth';
import { ApiUpdateUserRequest } from '~/api/auth/types';
import { useUser } from '~/hooks/auth/useUser';

export const usePatchUser = () => {
  const { update } = useUser();
  const { uploadFile } = useUploader(UploadSubject.Avatar, UploadTarget.Profiles);

  const save = useCallback(
    async (user: Partial<ApiUpdateUserRequest['user']>) => {
      const result = await apiUpdateUser({ user });
      await update(result.user);
      return result.user;
    },
    [update]
  );

  const updatePhoto = useCallback(
    async (file: File) => {
      try {
        const photo = await uploadFile(file);
        await save({ photo });
      } catch (error) {
        showErrorToast(error);
      }
    },
    [uploadFile, save]
  );

  return { updatePhoto, save };
};