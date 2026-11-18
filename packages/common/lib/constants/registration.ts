/** Where a registration request is in its life. */
export const REGISTRATION_STATUSES = {
  /** Waits for an admin. */
  PENDING_APPROVAL: 'pending_approval',
  /** Allowed to register; the link is being or has been mailed. */
  APPROVED: 'approved',
  REJECTED: 'rejected',
  /** The user was created. */
  COMPLETED: 'completed',
} as const;

export type RegistrationStatus =
  (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];

/** State of mailing the registration link. */
export const REGISTRATION_DELIVERIES = {
  /** Nothing to send yet. */
  NONE: 'none',
  /** Waiting for its next attempt. */
  QUEUED: 'queued',
  SENT: 'sent',
  /** Every attempt failed; only an admin can send it again. */
  FAILED: 'failed',
} as const;

export type RegistrationDelivery =
  (typeof REGISTRATION_DELIVERIES)[keyof typeof REGISTRATION_DELIVERIES];

export const MAX_REGISTRATION_REASON_LENGTH = 2000;
