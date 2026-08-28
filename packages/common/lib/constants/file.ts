/**
 * File types. The column enum is wider than the `image`/`audio` pair the uploader
 * produces, so all four must be accepted.
 */
export const FILE_TYPES = {
  IMAGE: 'image',
  TEXT: 'text',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

/** Column enum member order for `file.type`. */
export const FILE_TYPE_ENUM_ORDER: readonly FileType[] = [
  FILE_TYPES.IMAGE,
  FILE_TYPES.TEXT,
  FILE_TYPES.AUDIO,
  FILE_TYPES.VIDEO,
];

export const IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export const AUDIO_MIMES = ['audio/mp3', 'audio/mpeg', 'audio/mpeg3'] as const;

/** Where an upload is filed (`file.target`). */
export const UPLOAD_TARGETS = {
  NODES: 'nodes',
  COMMENTS: 'comments',
  PROFILES: 'profiles',
  OTHER: 'other',
} as const;

export type UploadTarget = (typeof UPLOAD_TARGETS)[keyof typeof UPLOAD_TARGETS];

/**
 * Image presets served from `cache/<preset>/<src>`. Width-only presets scale
 * proportionally; the rest crop to the given box. SVG is passed through
 * untouched for every preset.
 */
export const IMAGE_PRESETS = {
  '1600': { width: 1600 },
  '1200': { width: 1200 },
  '900': { width: 900 },
  '600': { width: 600 },
  '300': { width: 300 },
  avatar: { width: 72, height: 72, crop: true },
  cover: { width: 400, height: 400, crop: true },
  small_hero: { width: 800, height: 300, crop: true },
  /** Legacy alias of `small_hero`; both spellings are live in stored URLs. */
  smallhero: { width: 800, height: 300, crop: true },
  flow_square: { width: 400, height: 400, crop: true },
  flow_vertical: { width: 350, height: 700, crop: true },
  flow_horizontal: { width: 700, height: 350, crop: true },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;
