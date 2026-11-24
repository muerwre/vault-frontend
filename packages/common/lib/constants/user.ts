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
export const MAX_PASSWORD_LENGTH = 64;

export const MAX_USERNAME_LENGTH = 64;

/** Usernames are 3–64 chars of `[a-zA-Z0-9_-]`. */
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,64}$/;

/** Days without `last_seen` after which a user counts as inactive. */
export const USER_INACTIVITY_DAYS = 40;

/**
 * Sentinel stored in `user.password` for OAuth-only accounts. Such accounts must
 * never authenticate by password — treat any comparison against it as a failure.
 */
export const PASSWORD_PLACEHOLDER = 'NO_PASSWORD';

/** Longest full name. Covers every existing one, with room to spare. */
export const MAX_FULLNAME_LENGTH = 40;

/** Longest profile description: a line shown by the avatar. */
export const MAX_DESCRIPTION_LENGTH = 64;

/** A profile keeps at most this many entries of additional info. */
export const MAX_PROFILE_INFO_ITEMS = 5;

/** Longer titles and values of additional info are cut to these. */
export const MAX_PROFILE_INFO_TITLE_LENGTH = 16;
export const MAX_PROFILE_INFO_VALUE_LENGTH = 64;

/** Longest accepted profile about text. */
export const MAX_PROFILE_ABOUT_LENGTH = 8192;

/** How a profile lists its nodes: as flow cells or as lab cards. */
export const PROFILE_NODES_VIEW = {
  FLOW: 'flow',
  LAB: 'lab',
} as const;

export type ProfileNodesView =
  (typeof PROFILE_NODES_VIEW)[keyof typeof PROFILE_NODES_VIEW];
