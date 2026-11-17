import { URLS } from '~/constants/urls';

/** The admin page's sections, in sidebar order; the first is the default. */
export const ADMIN_SECTIONS = [
  { key: 'users', title: 'Пользователи', url: URLS.ADMIN.USERS },
  {
    key: 'transcoding',
    title: 'Транскодирование',
    url: URLS.ADMIN.TRANSCODING,
  },
] as const;

export type AdminSectionKey = (typeof ADMIN_SECTIONS)[number]['key'];
