import { sourceStatusFromOembed } from './media-source.service';

describe('sourceStatusFromOembed', () => {
  it.each([
    [200, 'available'],
    [401, 'gone'],
    [403, 'gone'],
    [404, 'gone'],
    [429, null],
    [500, null],
    [503, null],
  ])('reads %i as %p', (status, expected) => {
    expect(sourceStatusFromOembed(status)).toBe(expected);
  });
});
