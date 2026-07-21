export interface EmbedMetadata {
  provider: string;
  address: string;
  id: number;
  metadata: {
    title: string;
    thumb: string;
    duration: string;
  };
}
