import {
  MEDIA_PROVIDER_DEFS,
  MEDIA_PROVIDERS,
  type MediaProvider,
} from '@vault/common/media';

import { youtubeThumbPath } from '../upload/upload.paths';

/** Local copies of external items, under the uploads root. */
export const MEDIA_DIR = 'media';

/** Uploads in progress, moved into place when their job completes. */
export const MEDIA_INCOMING_DIR = `${MEDIA_DIR}/.incoming`;

/**
 * Ids end up in file names, so only ids the provider itself considers valid
 * are accepted here.
 */
const checkedId = (provider: MediaProvider, id: string): string => {
  if (!MEDIA_PROVIDER_DEFS[provider]?.isValidId(id)) {
    throw new Error(`invalid ${provider} id: ${id}`);
  }

  return id;
};

export const mediaVideoPath = (provider: MediaProvider, id: string): string =>
  `${MEDIA_DIR}/${provider}/${checkedId(provider, id)}.mp4`;

/** YouTube covers keep the path they were already served from. */
export const mediaThumbPath = (provider: MediaProvider, id: string): string =>
  provider === MEDIA_PROVIDERS.YOUTUBE
    ? youtubeThumbPath(checkedId(provider, id))
    : `${MEDIA_DIR}/${provider}/${checkedId(provider, id)}.jpg`;
