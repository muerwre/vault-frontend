import type { IUser } from './user';

/**
 * Wire shape of a tag.
 *
 * ⚠️ The primary key serialises as **`ID`** (uppercase) — the frontend's `ITag`
 * reads `ID`. Keep the uppercase key.
 */
export interface ITag {
  ID: number;
  title: string;
  data?: Record<string, string>;
  user?: Partial<IUser>;
  created_at?: string;
  updated_at?: string;
}
