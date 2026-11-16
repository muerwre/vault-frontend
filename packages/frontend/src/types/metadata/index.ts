import type { IEmbedVideo } from '@vault/common/types';

export interface EmbedMetadata {
  provider: string;
  address: string;
  id: number;
  metadata: {
    title: string;
    thumb: string;
    duration: string;
  };
  /** Our copy of the video, when the backend keeps one. */
  video?: IEmbedVideo;
}
