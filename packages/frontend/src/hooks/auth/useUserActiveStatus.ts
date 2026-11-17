import { isUserActive } from '~/utils/user';

const today = new Date();

export const useUserActiveStatus = (lastSeen?: string) =>
  isUserActive(lastSeen, today);
