import { validateSocialRegister } from './oauth.validation';

describe('validateSocialRegister', () => {
  it('accepts a usable username and password', () => {
    expect(
      validateSocialRegister({ username: 'muerwre', password: 'hunter2' }),
    ).toBeNull();
  });

  /** An empty body is the first call of the flow: both fields are reported. */
  it('reports both fields when nothing is supplied', () => {
    expect(validateSocialRegister({})).toEqual({
      username: expect.any(String),
      password: expect.any(String),
    });
  });

  it('rejects a username that is too short or has stray characters', () => {
    for (const username of ['ab', 'has space', 'кириллица', 'dots.here']) {
      expect(validateSocialRegister({ username, password: 'hunter2' })).toEqual(
        {
          username: expect.any(String),
        },
      );
    }
  });

  it('accepts hyphens, underscores and digits', () => {
    expect(
      validateSocialRegister({ username: 'a_b-c-99', password: 'hunter2' }),
    ).toBeNull();
  });

  it('rejects a password under the minimum length', () => {
    expect(
      validateSocialRegister({ username: 'muerwre', password: '12345' }),
    ).toEqual({ password: expect.any(String) });
  });

  it('accepts a password of exactly the minimum length', () => {
    expect(
      validateSocialRegister({ username: 'muerwre', password: '123456' }),
    ).toBeNull();
  });
});
