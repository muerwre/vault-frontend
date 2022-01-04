import { hideToast, showToastError } from '~/utils/toast';
import { has, path } from 'ramda';
import { ERROR_LITERAL, ERRORS } from '~/constants/errors';

let toastId = '';

const handleUnknown = (message: string) => console.warn(message);
const handleTranslated = (message: string) => {
  if (toastId) {
    hideToast(toastId);
  }

  toastId = showToastError(ERROR_LITERAL[message]);
};

export const showErrorToast = (error: unknown) => {
  if (typeof error === 'string' && has(error, ERROR_LITERAL)) {
    handleTranslated(error);
    return;
  }

  if (!(error instanceof Error)) {
    console.warn('catched strange exception', error);
    return;
  }

  // TODO: Network error
  if (error.message === 'Network Error') {
    handleTranslated(ERRORS.NETWORK_ERROR);
    return;
  }

  const messageFromBackend = String(path(['response', 'data', 'error'], error));
  if (messageFromBackend && has(messageFromBackend, ERROR_LITERAL)) {
    handleTranslated(messageFromBackend);
    return;
  }

  handleUnknown(error.message);
};
