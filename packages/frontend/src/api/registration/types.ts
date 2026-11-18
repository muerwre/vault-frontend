import { IUser } from '~/types/auth';

/** What the backend currently allows; both off while its mail is down. */
export interface ApiFeatures {
  registration: boolean;
  registration_approval: boolean;
}

/** What the guest is told after submitting the form. */
export type ApiRegistrationOutcome = 'mailed' | 'awaiting_approval';

export interface ApiRequestRegistrationRequest {
  email: string;
  reason?: string;
}

export interface ApiRequestRegistrationResult {
  status: ApiRegistrationOutcome;
}

export interface ApiCheckRegistrationCodeResult {
  email: string;
}

export interface ApiCompleteRegistrationRequest {
  code: string;
  username: string;
  password: string;
}

export interface ApiCompleteRegistrationResult {
  user: IUser;
  token: string;
}

export type ApiRegistrationStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed';

export type ApiRegistrationDelivery = 'none' | 'queued' | 'sent' | 'failed';

/** A request as the admin page lists it. */
export interface ApiRegistrationRequest {
  id: number;
  email: string;
  reason: string;
  status: ApiRegistrationStatus;
  delivery: ApiRegistrationDelivery;
  send_attempts: number;
  last_error: string;
  next_attempt_at: string | null;
  last_sent_at: string | null;
  code_expires_at: string | null;
  /** The link was sent but can no longer be used. */
  is_expired: boolean;
  /** The mailed link, while it can still be used. */
  link: string | null;
  requested_at: string | null;
  created_at: string | null;
}
