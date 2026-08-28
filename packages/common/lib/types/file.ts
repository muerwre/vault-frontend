import type { FileType, UploadTarget } from '../constants/file';

/** `file.metadata` JSON blob. `duration` is a **number** here (unlike embed). */
export interface FileMetadata {
  width?: number;
  height?: number;
  id3title?: string;
  id3artist?: string;
  title?: string;
  duration?: number;
  dominant_color?: string;
}

/**
 * Wire shape of a file. Mirrors the frontend's `IFile`.
 *
 * ⚠️ Casing is inconsistent by design: `createdAt`/`updatedAt` are camelCase
 * while `user_id`/`node_id` are snake_case. Do not normalise.
 */
export interface IFile {
  id: number;
  name: string;
  orig_name: string;
  path: string;
  full_path: string;
  url: string;
  size: number;
  type?: FileType;
  mime: string;
  metadata?: FileMetadata;

  user_id?: number;
  node_id?: number;
  target?: UploadTarget;

  createdAt?: string;
  updatedAt?: string;
}
