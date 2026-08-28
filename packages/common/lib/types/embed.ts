/**
 * `embed.metadata` JSON blob. `duration` is a string here, unlike
 * `FileMetadata.duration`.
 */
export interface EmbedMetadata {
  title?: string;
  thumb?: string;
  duration?: string;
}

export interface IEmbed {
  id: number;
  provider: string;
  address: string;
  metadata?: EmbedMetadata;
}
