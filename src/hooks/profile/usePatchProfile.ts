import { useUploader } from '~/hooks/data/useUploader';
import { UploadSubject, UploadTarget } from '~/constants/uploads';
import { useCallback } from 'react';
import { showErrorToast } from '~/utils/errors/showToast';
import { IUser } from '~/redux/auth/types';
import { apiUpdateUser } from '~/redux/auth/api';

export const usePatchProfile = (updateUserData: (user: Partial<IUser>) => void) => {
  const { uploadFile } = useUploader(UploadSubject.Avatar, UploadTarget.Profiles);

  const updateProfile = useCallback(async (user: Partial<IUser>) => {
    const result = await apiUpdateUser({ user });
    await updateUserData(result.user);
    return result.user;
  }, []);

  const updatePhoto = useCallback(
    async (file: File) => {
      try {
        const photo = await uploadFile(file);
        await updateProfile({ photo });
      } catch (error) {
        showErrorToast(error);
      }
    },
    [updateUserData, uploadFile, updateProfile]
  );

  return { updatePhoto, updateProfile };
};
