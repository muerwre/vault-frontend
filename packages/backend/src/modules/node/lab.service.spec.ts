import { LAB_DEFAULT_LIMIT, LAB_MAX_LIMIT, normaliseLabQuery } from './lab.service';

describe('normaliseLabQuery', () => {
  it('defaults everything on an empty query', () => {
    expect(normaliseLabQuery({})).toEqual({
      limit: LAB_DEFAULT_LIMIT,
      offset: 0,
      sort: 'new',
      search: '',
    });
  });

  it('accepts a limit within range', () => {
    expect(normaliseLabQuery({ limit: '50' }).limit).toBe(50);
    expect(normaliseLabQuery({ limit: String(LAB_MAX_LIMIT) }).limit).toBe(
      LAB_MAX_LIMIT,
    );
  });

  /** An over-large limit falls back rather than being clamped to the max. */
  it('falls back on a limit that is out of range or unparseable', () => {
    for (const limit of ['0', '-5', '101', 'abc', '']) {
      expect(normaliseLabQuery({ limit }).limit).toBe(LAB_DEFAULT_LIMIT);
    }
  });

  it('floors a negative or unparseable offset at zero', () => {
    for (const offset of ['-1', 'abc', '']) {
      expect(normaliseLabQuery({ offset }).offset).toBe(0);
    }
    expect(normaliseLabQuery({ offset: '40' }).offset).toBe(40);
  });

  it('accepts the three known sorts and falls back otherwise', () => {
    for (const sort of ['new', 'hot', 'heroic']) {
      expect(normaliseLabQuery({ sort }).sort).toBe(sort);
    }
    expect(normaliseLabQuery({ sort: 'sideways' }).sort).toBe('new');
  });

  it('trims the search term', () => {
    expect(normaliseLabQuery({ search: '  дом  ' }).search).toBe('дом');
  });
});
