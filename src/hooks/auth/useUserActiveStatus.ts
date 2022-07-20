import { differenceInDays, parseISO } from 'date-fns';

import { INACTIVE_ACCOUNT_DAYS } from '~/constants/user';

const today = new Date();

export const useUserActiveStatus = (lastSeen?: string) => {
  try {
    const lastSeenDate = lastSeen ? parseISO(lastSeen) : undefined;
    return lastSeenDate && differenceInDays(today, lastSeenDate) < INACTIVE_ACCOUNT_DAYS;
  } catch (e) {
    return false;
  }
};
