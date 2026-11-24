import {
  MAX_PROFILE_INFO_ITEMS,
  MAX_PROFILE_INFO_TITLE_LENGTH,
  MAX_PROFILE_INFO_VALUE_LENGTH,
  NODE_FLOW_DISPLAY,
  PROFILE_NODES_VIEW,
  type ProfileNodesView,
} from '@vault/common/constants';
import type { IProfileInfoItem } from '@vault/common/types';

type Parsed<T> = { value: T } | { error: string };

const asString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Additional info as sent by the client: `{ title, value }` entries, links or
 * any other text. Content is taken as written; entries are trimmed, too long
 * ones cut, those without a value dropped, and only the first
 * `MAX_PROFILE_INFO_ITEMS` kept. Only a malformed list is refused.
 */
export const parseProfileInfo = (
  input: unknown,
): Parsed<IProfileInfoItem[]> => {
  if (
    !Array.isArray(input) ||
    input.some((item) => !item || typeof item !== 'object')
  ) {
    return { error: 'Неверный формат' };
  }

  const items = (input as Array<Record<string, unknown>>)
    .map((item) => ({
      title: asString(item.title).slice(0, MAX_PROFILE_INFO_TITLE_LENGTH),
      value: asString(item.value).slice(0, MAX_PROFILE_INFO_VALUE_LENGTH),
    }))
    .filter((item) => item.value)
    .slice(0, MAX_PROFILE_INFO_ITEMS);

  return { value: items };
};

const DISPLAY_VARIANTS: readonly string[] = Object.values(NODE_FLOW_DISPLAY);

/** About card size. Must be one of the flow-cell variants. */
export const parseAboutDisplay = (input: unknown): Parsed<string> =>
  typeof input === 'string' && DISPLAY_VARIANTS.includes(input)
    ? { value: input }
    : { error: 'Неизвестный размер' };

const NODES_VIEWS: readonly string[] = Object.values(PROFILE_NODES_VIEW);

/** How visitors first see the profile's nodes. */
export const parseNodesView = (input: unknown): Parsed<ProfileNodesView> =>
  typeof input === 'string' && NODES_VIEWS.includes(input)
    ? { value: input as ProfileNodesView }
    : { error: 'Неизвестный вид' };
