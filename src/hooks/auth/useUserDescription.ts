import { differenceInDays, parseISO } from 'date-fns';

import { useRandomPhrase } from '~/constants/phrases';
import { INACTIVE_ACCOUNT_DAYS } from '~/constants/user';
import { IUser } from '~/types/auth';

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
