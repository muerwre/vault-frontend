import { isHevcImage } from './raster';

/** An `ftyp` box with the given major and compatible brands. */
const ftyp = (major: string, compatible: string[]): Buffer => {
  const size = 16 + compatible.length * 4;
  const box = Buffer.alloc(size + 16);

  box.writeUInt32BE(size, 0);
  box.write('ftyp', 4, 'ascii');
  box.write(major, 8, 'ascii');
  compatible.forEach((brand, i) => box.write(brand, 16 + i * 4, 'ascii'));

  return box;
};

describe('isHevcImage', () => {
  it.each([
    ['heic', []],
    ['heix', ['mif1']],
    ['mif1', ['mif1', 'heic']],
  ])('matches major brand %p (compatible %p)', (major, compatible) => {
    expect(isHevcImage(ftyp(major, compatible))).toBe(true);
  });

  it('leaves AVIF to the image library', () => {
    expect(isHevcImage(ftyp('avif', ['mif1', 'miaf']))).toBe(false);
    expect(isHevcImage(ftyp('mif1', ['avif', 'miaf']))).toBe(false);
  });

  it('ignores other formats and short input', () => {
    expect(isHevcImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe(false);
    expect(isHevcImage(Buffer.alloc(0))).toBe(false);
  });
});
