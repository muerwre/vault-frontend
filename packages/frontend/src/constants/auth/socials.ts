import { OAuthProvider } from '~/types/auth';

export const SOCIAL_ICONS: Record<OAuthProvider, string> = {
  vkontakte: 'vk',
  google: 'google',
  telegram: 'telegram',
};

export type BacklinkSource = 'vkontakte';

export const BACKLINK_TITLES: Record<BacklinkSource, string> = {
  vkontakte: 'Суицидальные роботы',
};
