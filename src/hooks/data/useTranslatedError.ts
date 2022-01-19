import { useMemo } from 'react';

import { has } from 'ramda';

import { ERROR_LITERAL } from '~/constants/errors';

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
