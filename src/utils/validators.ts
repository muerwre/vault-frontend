import isValid from 'date-fns/isValid';
import { IMAGE_MIME_TYPES } from '~/utils/uploader';

const isValidEmail = (email: string): boolean =>
  !!email &&
  !!String(email) &&
  !!String(email).match(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
  );

const isLikeEmail = (email: string): boolean =>
  !!email && !!String(email) && !!String(email).match(/^([^\@]+)@([^\@]+)\.([^\@]+)$$/);

const isNonEmpty = (value: string): boolean => !!value && value.trim().length > 0;
const isLikePhone = isNonEmpty;

const isAtLeast = (length: number, value: string): boolean =>
  !!value && value.trim().length >= length;

const isMimeOfImage = (mime): boolean => !!mime && IMAGE_MIME_TYPES.indexOf(mime) >= 0;

const isDate = (val: string): boolean => !!val && isValid(new Date(val));
const isStringDate = (val: string): boolean => !!val && !!val.match(/^[\d]{2,4}\-[\d]{2}-[\d]{2}/);

export const VALIDATORS = {
  EMAIL: isValidEmail,
  LIKE_PHONE: isLikePhone,
  LIKE_EMAIL: isLikeEmail,
  NON_EMPTY: isNonEmpty,
  AT_LEAST: length => isAtLeast.bind(null, length),
  IS_IMAGE_MIME: isMimeOfImage,
  IS_DATE: isDate,
  IS_STRINGY_DATE: isStringDate,
  EVOLVE: (validator: (val: any) => boolean, error: string) => (val: any) =>
    !val || !validator(val) ? error : null,
};
