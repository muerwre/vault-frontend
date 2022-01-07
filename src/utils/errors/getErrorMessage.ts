import { has, path } from 'ramda';
import { ERROR_LITERAL, ERRORS } from '~/constants/errors';

export const getErrorMessage = (error: unknown) => {
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
