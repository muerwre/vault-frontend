import { hasPath, path } from 'ramda';

export const getValidationErrors = (error: unknown): Record<string, string> | undefined => {
  if (hasPath(['response', 'data', 'errors'], error)) {
    return path(['response', 'data', 'errors'], error);
  }

  return;
};
