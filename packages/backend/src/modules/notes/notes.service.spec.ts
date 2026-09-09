import {
  NOTES_DEFAULT_LIMIT,
  NOTES_MAX_LIMIT,
  normaliseNotesQuery,
} from './notes.service';

describe('normaliseNotesQuery', () => {
  it('defaults everything on an empty query', () => {
    expect(normaliseNotesQuery({})).toEqual({
      limit: NOTES_DEFAULT_LIMIT,
      offset: 0,
      search: '',
    });
  });

  it('accepts a limit within range', () => {
    expect(normaliseNotesQuery({ limit: '10' }).limit).toBe(10);
    expect(normaliseNotesQuery({ limit: String(NOTES_MAX_LIMIT) }).limit).toBe(
      NOTES_MAX_LIMIT,
    );
  });

  it('falls back on an out-of-range or unparseable limit', () => {
    for (const limit of ['0', '-1', '101', 'abc', '']) {
      expect(normaliseNotesQuery({ limit }).limit).toBe(NOTES_DEFAULT_LIMIT);
    }
  });

  it('floors the offset at zero', () => {
    expect(normaliseNotesQuery({ offset: '-5' }).offset).toBe(0);
    expect(normaliseNotesQuery({ offset: '7' }).offset).toBe(7);
  });

  it('trims the search term', () => {
    expect(normaliseNotesQuery({ search: '  note  ' }).search).toBe('note');
  });
});
