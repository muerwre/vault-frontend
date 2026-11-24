import { parseAboutDisplay, parseProfileInfo } from './profile-fields';

describe('profile fields', () => {
  describe('parseProfileInfo', () => {
    it('takes any text as written, links or not', () => {
      const info = [
        { title: 'ВК', value: 'vk.com/id1' },
        { title: '', value: 'Люблю котов' },
      ];

      expect(parseProfileInfo(info)).toEqual({ value: info });
    });

    it('trims entries and drops those without a value', () => {
      expect(
        parseProfileInfo([
          { title: ' a ', value: ' x ' },
          { title: 'b', value: '   ' },
        ]),
      ).toEqual({ value: [{ title: 'a', value: 'x' }] });
    });

    it('accepts an empty list, which clears the info', () => {
      expect(parseProfileInfo([])).toEqual({ value: [] });
    });

    it('keeps only the first entries and cuts long ones', () => {
      const parsed = parseProfileInfo(
        Array.from({ length: 6 }, (_, i) => ({
          title: 't'.repeat(100),
          value: `${i}${'v'.repeat(300)}`,
        })),
      );

      expect('value' in parsed && parsed.value).toHaveLength(5);
      expect('value' in parsed && parsed.value[0].title).toHaveLength(16);
      expect('value' in parsed && parsed.value[0].value).toHaveLength(64);
    });

    it('treats a missing or non-string field as empty', () => {
      expect(
        parseProfileInfo([{ value: 'x' }, { title: 1, value: 2 }]),
      ).toEqual({ value: [{ title: '', value: 'x' }] });
    });

    it('refuses anything but a list of objects', () => {
      expect(parseProfileInfo('x')).toEqual({ error: expect.any(String) });
      expect(parseProfileInfo(['https://a.com'])).toEqual({
        error: expect.any(String),
      });
    });
  });

  describe('parseAboutDisplay', () => {
    it.each(['single', 'vertical', 'horizontal', 'quadro'])(
      'accepts %s',
      (display) => {
        expect(parseAboutDisplay(display)).toEqual({ value: display });
      },
    );

    it.each([[''], ['huge'], [null], [1]])('rejects %p', (display) => {
      expect(parseAboutDisplay(display)).toEqual({
        error: expect.any(String),
      });
    });
  });
});
