declare module 'heic-decode' {
  interface DecodedImage {
    width: number;
    height: number;
    /** RGBA, four bytes per pixel. */
    data: Uint8ClampedArray;
  }

  /** Decodes the primary image of a HEIC/HEIF file. */
  function decode(options: {
    buffer: Buffer | ArrayBuffer;
  }): Promise<DecodedImage>;

  export = decode;
}
