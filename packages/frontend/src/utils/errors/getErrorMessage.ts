import { ERROR_LITERAL, ERRORS } from '~/constants/errors';
import { has, path } from '~/utils/ramda';

export const getErrorMessage = (error: unknown): string | undefined => {
  if (error === undefined) {
    return undefined;
  }

  if (path(['response', 'data', 'message'], error)) {
    return path(['response', 'data', 'message'], error) as string;
  }

  if (typeof error === 'string' && has(error, ERROR_LITERAL)) {
    return ERROR_LITERAL[error];
  }

  if (!(error instanceof Error)) {
    console.warn('catched strange exception', error);
    return;
  }

  // TODO: Network error
  if (error.message === 'Network Error') {
    return ERROR_LITERAL[ERRORS.NETWORK_ERROR];
  }

  const messageFromBackend = String(path(['response', 'data', 'error'], error));
  if (messageFromBackend && has(messageFromBackend, ERROR_LITERAL)) {
    return ERROR_LITERAL[messageFromBackend];
  }

  return undefined;
};
