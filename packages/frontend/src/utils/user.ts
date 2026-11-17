import { differenceInDays, parseISO } from 'date-fns';

import { INACTIVE_ACCOUNT_DAYS } from '~/constants/user';

/**
 * Whether a user counts as active: seen within the last
 * `INACTIVE_ACCOUNT_DAYS`. Inactive users read as «Юнит деактивирован».
 */
export const isUserActive = (lastSeen?: string, now = new Date()): boolean => {
  try {
    const lastSeenDate = lastSeen ? parseISO(lastSeen) : undefined;

    return (
      !!lastSeenDate &&
      differenceInDays(now, lastSeenDate) < INACTIVE_ACCOUNT_DAYS
    );
  } catch (e) {
    return false;
  }
};
