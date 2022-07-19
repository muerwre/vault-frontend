import { useRandomPhrase } from '~/constants/phrases';
import { useUserActiveStatus } from '~/hooks/auth/useUserActiveStatus';
import { IUser } from '~/types/auth';

export const useUserDescription = (user?: Partial<IUser>) => {
  const randomPhrase = useRandomPhrase('USER_DESCRIPTION');

  if (!user) {
    return '';
  }

  const isActive = useUserActiveStatus(user.last_seen);

  if (!isActive) {
    return 'Юнит деактивирован';
  }

  return user.description || randomPhrase;
};
