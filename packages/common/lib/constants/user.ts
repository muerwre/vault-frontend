/** User roles. DB column is `user.role` ENUM('user','guest','admin') DEFAULT 'user'. */
export const ROLES = {
  GUEST: 'guest',
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles allowed to create nodes. */
export const ROLES_CAN_CREATE_NODE: readonly Role[] = [ROLES.USER, ROLES.ADMIN];

/** `uid = 0` means guest throughout. */
export const GUEST_USER_ID = 0;

export const MIN_PASSWORD_LENGTH = 6;

/** Usernames are 3–64 chars of `[a-zA-Z0-9_-]`. */
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

/** Days without `last_seen` after which a user counts as inactive. */
export const USER_INACTIVITY_DAYS = 40;

/**
 * Sentinel stored in `user.password` for OAuth-only accounts. Such accounts must
 * never authenticate by password — treat any comparison against it as a failure.
 */
export const PASSWORD_PLACEHOLDER = 'NO_PASSWORD';
