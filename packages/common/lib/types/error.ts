import type { ErrorCode } from '../constants/codes';

/**
 * The error envelope every failing response must use — the frontend's axios
 * interceptor reads `error.response.data.error`.
 */
export interface IErrorResponse {
  error: ErrorCode | string;
  message?: string;
}

/** Validation variant (auth patch, oauth register). */
export interface IValidationErrorResponse extends IErrorResponse {
  errors: Record<string, string>;
}
