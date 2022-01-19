import { createContext, FC, useContext } from 'react';

import { EMPTY_USER } from '~/constants/auth';
import { useGetProfile } from '~/hooks/profile/useGetProfile';
import { IUser } from '~/types/auth';

interface ProfileProviderProps {
  username: string;
}

interface ProfileContextValue {
  profile: IUser;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: EMPTY_USER,
  isLoading: false,
});

export const ProfileProvider: FC<ProfileProviderProps> = ({ children, username }) => {
  const { profile, isLoading } = useGetProfile(username);

  return (
    <ProfileContext.Provider value={{ profile, isLoading }}>{children}</ProfileContext.Provider>
  );
};

export const useProfileContext = () => useContext(ProfileContext);
