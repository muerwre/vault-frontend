import decodeHeic from 'heic-decode';
import sharp, { type Sharp, type SharpOptions } from 'sharp';

/** ISO-BMFF brands of HEVC-coded images (iPhone photos). */
const HEVC_BRANDS = new Set([
  'heic',
  'heix',
  'hevc',
  'hevx',
  'heim',
  'heis',
  'hevm',
  'hevs',
]);

/** Generic HEIF brands; the file is HEVC only if it also lists a HEVC brand. */
const GENERIC_BRANDS = new Set(['mif1', 'msf1']);

/**
 * Whether the bytes are an HEVC-coded HEIF image. Read from the content rather
 * than the declared type or extension, which are often wrong for these. AVIF
 * shares the container but is decoded fine by the image library, so it is not
 * matched.
 */
export const isHevcImage = (contents: Buffer): boolean => {
  if (contents.length < 16 || contents.toString('ascii', 4, 8) !== 'ftyp') {
    return false;
  }

  const boxSize = Math.min(contents.readUInt32BE(0), contents.length);
  const major = contents.toString('ascii', 8, 12);

  if (HEVC_BRANDS.has(major)) {
    return true;
  }

  if (!GENERIC_BRANDS.has(major)) {
    return false;
  }

  // Compatible brands follow the major brand and its minor version.
  for (let offset = 16; offset + 4 <= boxSize; offset += 4) {
    if (HEVC_BRANDS.has(contents.toString('ascii', offset, offset + 4))) {
      return true;
    }
  }

  return false;
};

/**
 * A pipeline over an image's pixels. The prebuilt image library reads HEIC
 * headers but has no HEVC decoder, so those are decoded separately and handed
 * over as raw pixels; their rotation is already applied by that decoder.
 */
export const openRaster = async (
  contents: Buffer,
  options: SharpOptions = {},
): Promise<Sharp> => {
  if (!isHevcImage(contents)) {
    return sharp(contents, options);
  }

  const { width, height, data } = await decodeHeic({ buffer: contents });

  return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
    raw: { width, height, channels: 4 },
  });
};
