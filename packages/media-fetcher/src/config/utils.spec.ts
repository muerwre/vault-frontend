import { nonNegativeInt, parseLadder, positiveInt } from './utils';

describe('env readers', () => {
  it.each([
    ['480, 720 ,360', [720, 480, 360]],
    ['1080,1080', [1080]],
    ['', [720, 480, 360]],
    ['nonsense', [720, 480, 360]],
  ])('reads the ladder %p', (value, ladder) => {
    expect(parseLadder(value)).toEqual(ladder);
  });

  it.each([
    ['5', 5],
    ['0', 9],
    ['-1', 9],
    ['', 9],
    [undefined, 9],
  ])('reads %p as a positive number', (value, expected) => {
    expect(positiveInt(value, 9)).toBe(expected);
  });

  it('accepts zero where zero is allowed', () => {
    expect(nonNegativeInt('0', 9)).toBe(0);
    expect(nonNegativeInt('x', 9)).toBe(9);
  });
});
