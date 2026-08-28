import type { ErrorCode } from '../constants/codes';

/** The envelope every failing response must use. */
export interface IErrorResponse {
  error: ErrorCode | string;
  message?: string;
}

/** Validation variant (auth patch, oauth register). */
export interface IValidationErrorResponse extends IErrorResponse {
  errors: Record<string, string>;
}
