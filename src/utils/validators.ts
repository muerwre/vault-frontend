import { IMAGE_MIME_TYPES } from '~/constants/uploads';

export const isMimeOfImage = (mime): boolean =>
  !!mime && IMAGE_MIME_TYPES.indexOf(mime) >= 0;
