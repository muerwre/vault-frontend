import type { File } from '../../entities/file.entity';

import { capSongs } from './node-files';

const file = (id: number, type: string) => ({ id, type }) as File;

describe('capSongs', () => {
  it('keeps the first songs and every other file, in order', () => {
    const files = [
      file(1, 'image'),
      file(2, 'audio'),
      file(3, 'audio'),
      file(4, 'image'),
      file(5, 'audio'),
    ];

    expect(capSongs(files, 2).map((it) => it.id)).toEqual([1, 2, 3, 4]);
  });

  it('leaves a short list alone', () => {
    const files = [file(1, 'audio'), file(2, 'image')];

    expect(capSongs(files, 4)).toEqual(files);
  });
});
