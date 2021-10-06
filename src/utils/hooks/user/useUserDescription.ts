import { IUser } from '~/redux/auth/types';
import { useRandomPhrase } from '~/constants/phrases';
import { differenceInDays, parseISO } from 'date-fns';
import { INACTIVE_ACCOUNT_DAYS } from '~/constants/user';

const today = new Date();

export const useUserDescription = (user?: Partial<IUser>) => {
  const randomPhrase = useRandomPhrase('USER_DESCRIPTION');

  if (!user) {
    return '';
  }

  const lastSeen = user.last_seen ? parseISO(user.last_seen) : undefined;
  if (!lastSeen || differenceInDays(today, lastSeen) > INACTIVE_ACCOUNT_DAYS) {
    return 'Юнит деактивирован';
  }

  return user.description || randomPhrase;
};
