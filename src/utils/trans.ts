import { ERROR_LITERAL, ERRORS } from '~/constants/errors';
import { ValueOf } from '~/types';

export const t = (
  string: ValueOf<typeof ERRORS>,
): ValueOf<typeof ERROR_LITERAL> => ERROR_LITERAL[string] || string;
