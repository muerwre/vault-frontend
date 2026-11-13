/**
 * A boolean query flag, read the way clients have always sent it: `1`, `t` and
 * `true` in any case are true, `0`, `f`, `false` are false, and absent is false.
 * Anything else is null, which callers refuse rather than guess at.
 */
export const parseQueryBool = (value: unknown): boolean | null => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalised = String(value).toLowerCase();

  if (['1', 't', 'true'].includes(normalised)) {
    return true;
  }

  return ['0', 'f', 'false'].includes(normalised) ? false : null;
};
