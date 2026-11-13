import { useMemo } from 'react';

import { ERROR_LITERAL } from '~/constants/errors';
import { has } from '~/utils/ramda';

export const useTranslatedError = (error: string | undefined) => {
  return useMemo(() => {
    if (!error) {
      return '';
    }

    if (!has(error, ERROR_LITERAL)) {
      return error;
    }

    return ERROR_LITERAL[error];
  }, [error]);
};
