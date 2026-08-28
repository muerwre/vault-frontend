/**
 * `embed.metadata` JSON blob.
 *
 * ⚠️ `duration` is a **string** here, unlike `FileMetadata.duration` which is a
 * number. Preserve the difference.
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
