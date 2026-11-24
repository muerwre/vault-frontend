import type { LucideIcon } from 'lucide-react';

import { GoogleIcon, TelegramIcon, VkIcon } from '~/components/icons';
import { OAuthProvider } from '~/types/auth';

export const SOCIAL_ICONS: Record<OAuthProvider, LucideIcon> = {
  vkontakte: VkIcon,
  google: GoogleIcon,
  telegram: TelegramIcon,
};

export type BacklinkSource = 'vkontakte';

export const BACKLINK_TITLES: Record<BacklinkSource, string> = {
  vkontakte: 'Суицидальные роботы',
};
