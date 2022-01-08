import { createContext, FC, useCallback, useContext } from 'react';
import { ApiUpdateUserRequest, IUser } from '~/redux/auth/types';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { EMPTY_USER } from '~/redux/auth/constants';
import { usePatchProfile } from '~/hooks/profile/usePatchProfile';
import { useUser } from '~/hooks/user/userUser';
import { useDispatch } from 'react-redux';
import { authSetUser } from '~/redux/auth/actions';

interface ProfileProviderProps {
  username: string;
}

interface ProfileContextValue {
  profile: IUser;
  isLoading: boolean;
  updatePhoto: (file: File) => Promise<unknown>;
  updateProfile: (user: Partial<ApiUpdateUserRequest['user']>) => Promise<IUser>;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: EMPTY_USER,
  isLoading: false,
  updatePhoto: async () => {},
  updateProfile: async () => EMPTY_USER,
});

export const ProfileProvider: FC<ProfileProviderProps> = ({ children, username }) => {
  const dispatch = useDispatch();

  const user = useUser();
  const { profile, isLoading, update: updateProfileData } = useGetProfile(username);

  const update = useCallback(
    async (data: Partial<IUser>) => {
      if (profile.id === user.id) {
        await updateProfileData(data);
      }

      // TODO: user updateUser from useGetUser or something
      dispatch(authSetUser(data));
    },
    [updateProfileData, dispatch, profile, user]
  );

  const { updatePhoto, updateProfile } = usePatchProfile(update);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, updatePhoto, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
