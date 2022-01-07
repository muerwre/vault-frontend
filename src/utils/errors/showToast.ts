import { hideToast, showToastError } from '~/utils/toast';
import { getErrorMessage } from '~/utils/errors/getErrorMessage';

let toastId = '';

const handleUnknown = (message: string) => console.warn(message);
const handleTranslated = (message: string) => {
  if (toastId) {
    hideToast(toastId);
  }

  toastId = showToastError(message);
};

export const showErrorToast = (error: unknown) => {
  const message = getErrorMessage(error);
  if (message) {
    return handleTranslated(message);
  }

  if (!(error instanceof Error)) {
    return;
  }

  handleUnknown(error.message);
};
