/**
 * `embed.metadata` JSON blob. `duration` is a string here, unlike
 * `FileMetadata.duration`.
 */
export interface EmbedMetadata {
  title?: string;
  thumb?: string;
  duration?: string;
}

/** Our local copy of an embedded video, when the media cache tracks it. */
export interface IEmbedVideo {
  /** One of `MEDIA_VIDEO_STATUSES`. */
  status: string;
  /** One of `MEDIA_SOURCE_STATUSES`: whether the original still plays. */
  source: string;
  /** 0–100, while downloading. */
  progress?: number;
  /** `REMOTE_CURRENT://…` url of the copy, once it is ready. */
  url?: string;
}

export interface IEmbed {
  id: number;
  provider: string;
  address: string;
  metadata?: EmbedMetadata;
  video?: IEmbedVideo;
}
