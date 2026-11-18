import { HttpStatus } from '@nestjs/common';

import type { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';

import {
  AuthController,
  LOGIN_FAILURES_PER_ACCOUNT,
  LOGIN_FAILURES_PER_IP,
  RESTORES_PER_ACCOUNT,
  RESTORES_PER_IP,
} from './auth.controller';
import type { AuthService } from './auth.service';
import type { PasswordService } from './password.service';

const SELF = { id: 1, username: 'someone' } as never;

/**
 * The validation matrix is pure logic, so it is driven with stubs rather than a
 * database.
 */
type AuthMock = Record<string, jest.Mock>;

const makeController = (overrides: AuthMock = {}, passwordValid = true) => {
  // `jest.fn().mockResolvedValue()` rather than arrow stubs: a spread of
  // overrides into an object of arrows defeats return-type inference.
  const auth: AuthMock = {
    authenticate: jest.fn().mockResolvedValue({ id: 1, username: 'someone' }),
    getSelf: jest.fn().mockResolvedValue(SELF),
    signToken: jest.fn().mockReturnValue('token'),
    touchLastSeen: jest.fn().mockResolvedValue(undefined),
    isUsernameTaken: jest.fn().mockResolvedValue(false),
    isEmailTaken: jest.fn().mockResolvedValue(false),
    findByUsernameOrEmail: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation(async (user: User) => user),
    setPassword: jest.fn().mockResolvedValue(undefined),
    saveProfile: jest.fn().mockResolvedValue(undefined),
    setPhoto: jest.fn().mockResolvedValue(undefined),
    setCover: jest.fn().mockResolvedValue(undefined),
    findImage: jest.fn().mockResolvedValue({ id: 5 }),
    createRestoreCode: jest.fn().mockResolvedValue('code'),
    sendRestoreCode: jest.fn().mockResolvedValue(undefined),
    findRestoreCode: jest.fn().mockResolvedValue(null),
    dropRestoreCodes: jest.fn().mockResolvedValue(undefined),
    toRestoreUser: jest
      .fn()
      .mockReturnValue({ username: 'someone', photo: null }),
    getUpdates: jest.fn().mockResolvedValue({ boris: { commented_at: 'x' } }),
    ...overrides,
  };

  const passwords: AuthMock = {
    verify: jest.fn().mockResolvedValue(passwordValid),
  };

  return {
    controller: new AuthController(
      auth as unknown as AuthService,
      passwords as unknown as PasswordService,
    ),
    auth,
    passwords,
  };
};

const currentUser = () =>
  ({
    id: 1,
    username: 'someone',
    email: 'someone@example.com',
    password: '$2b$10$hash',
    fullname: 'Full',
    description: 'Desc',
  }) as User;

describe('AuthController', () => {
  describe('login', () => {
    it('returns the user and a token', async () => {
      const { controller } = makeController();

      await expect(
        controller.login({ username: 'someone', password: 'pw' }),
      ).resolves.toEqual({ user: SELF, token: 'token' });
    });

    /** A 401 would make clients drop their session. */
    it('throws a 400, not a 401, on bad credentials', async () => {
      const { controller } = makeController({
        authenticate: jest.fn().mockResolvedValue(null),
      });

      await expect(
        controller.login({ username: 'x', password: 'y' }),
      ).rejects.toThrow(VaultException);

      try {
        await controller.login({ username: 'x', password: 'y' });
      } catch (error) {
        expect((error as VaultException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
        expect((error as VaultException).code).toBe('Incorrect_Data');
      }
    });

    it('tolerates a missing body', async () => {
      const { controller, auth } = makeController();

      await controller.login({} as never);

      expect(auth.authenticate).toHaveBeenCalledWith('', '');
    });
  });

  describe('rate limits', () => {
    it('refuses logins for an account after too many failures', async () => {
      const { controller, auth } = makeController({
        authenticate: jest.fn().mockResolvedValue(null),
      });

      for (
        let attempt = 0;
        attempt < LOGIN_FAILURES_PER_ACCOUNT;
        attempt += 1
      ) {
        await expect(
          controller.login(
            { username: 'Someone', password: 'wrong' },
            `10.0.0.${attempt}`,
          ),
        ).rejects.toMatchObject({ code: 'Incorrect_Data' });
      }

      // Counted case-insensitively, from any address.
      await expect(
        controller.login(
          { username: 'someone', password: 'right' },
          '10.1.1.1',
        ),
      ).rejects.toMatchObject({ code: 'Too_Many_Requests' });
      expect(auth.authenticate).toHaveBeenCalledTimes(
        LOGIN_FAILURES_PER_ACCOUNT,
      );
    });

    it('does not count successful logins', async () => {
      const { controller } = makeController();

      for (let attempt = 0; attempt <= LOGIN_FAILURES_PER_IP; attempt += 1) {
        await controller.login({ username: 'someone', password: 'pw' }, 'ip');
      }
    });

    it('limits reset requests per account', async () => {
      const { controller, auth } = makeController({
        findByUsernameOrEmail: jest.fn().mockResolvedValue({ id: 7 }),
      });

      for (let attempt = 0; attempt < RESTORES_PER_ACCOUNT; attempt += 1) {
        await controller.createRestoreCode(
          { field: 'someone' },
          `ip${attempt}`,
        );
      }

      await expect(
        controller.createRestoreCode({ field: 'someone' }, 'other'),
      ).rejects.toMatchObject({ code: 'Too_Many_Requests' });
      expect(auth.createRestoreCode).toHaveBeenCalledTimes(
        RESTORES_PER_ACCOUNT,
      );
    });

    it('limits reset requests per client, known account or not', async () => {
      const { controller } = makeController();

      for (let attempt = 0; attempt < RESTORES_PER_IP; attempt += 1) {
        await expect(
          controller.createRestoreCode({ field: `nobody${attempt}` }, 'ip'),
        ).rejects.toMatchObject({ code: 'User_Not_found' });
      }

      await expect(
        controller.createRestoreCode({ field: 'nobody' }, 'ip'),
      ).rejects.toMatchObject({ code: 'Too_Many_Requests' });
    });
  });

  describe('patch', () => {
    const patchErrors = async (
      body: Record<string, unknown>,
      opts: { passwordValid?: boolean; taken?: 'username' | 'email' } = {},
    ) => {
      const overrides: AuthMock = {};
      if (opts.taken === 'username') {
        overrides.isUsernameTaken = jest.fn().mockResolvedValue(true);
      }
      if (opts.taken === 'email') {
        overrides.isEmailTaken = jest.fn().mockResolvedValue(true);
      }

      const { controller } = makeController(
        overrides,
        opts.passwordValid ?? true,
      );

      try {
        await controller.patch(currentUser(), body as never);
        return null;
      } catch (error) {
        return (error as VaultValidationException).fields;
      }
    };

    it('passes only the profile fields that were sent', async () => {
      const { controller, auth } = makeController();

      await controller.patch(currentUser(), {
        about: 'text',
        links: ['https://a.com', ''],
      });

      expect(auth.saveProfile).toHaveBeenCalledWith(1, {
        about: 'text',
        links: ['https://a.com'],
      });
    });

    it('rejects bad profile fields under their own names', async () => {
      expect(
        await patchErrors({
          about_display: 'huge',
          links: ['nope'],
          about: 'x'.repeat(9000),
        }),
      ).toEqual({
        about_display: expect.any(String),
        links: expect.any(String),
        about: expect.any(String),
      });
    });

    it('applies description without touching fullname', async () => {
      const { controller, auth } = makeController();
      const user = currentUser();

      await controller.patch(user, { description: 'new desc' });

      const saved = auth.save.mock.calls[0][0] as User;
      expect(saved.description).toBe('new desc');
      expect(saved.fullname).toBe('Full');
    });

    it('applies fullname on its own', async () => {
      const { controller, auth } = makeController();
      const user = currentUser();

      await controller.patch(user, { fullname: 'New Name' });

      const saved = auth.save.mock.calls[0][0] as User;
      expect(saved.fullname).toBe('New Name');
      expect(saved.description).toBe('Desc');
    });

    it('requires the current password for a username change', async () => {
      expect(
        await patchErrors({ username: 'newname' }, { passwordValid: false }),
      ).toEqual({ password: expect.any(String) });
    });

    it('requires the current password for a password change', async () => {
      expect(
        await patchErrors(
          { new_password: 'longenough' },
          { passwordValid: false },
        ),
      ).toEqual({ password: expect.any(String) });
    });

    it('does not require a password for description or fullname', async () => {
      expect(
        await patchErrors(
          { description: 'x', fullname: 'y' },
          { passwordValid: false },
        ),
      ).toBeNull();
    });

    it('does not require a password when the value is unchanged', async () => {
      expect(
        await patchErrors(
          { email: 'someone@example.com', username: 'someone' },
          { passwordValid: false },
        ),
      ).toBeNull();
    });

    it('refuses to change the email, even with the right password', async () => {
      const { controller, auth } = makeController();
      const user = currentUser();

      await expect(
        controller.patch(user, { email: 'new@example.com' } as never),
      ).rejects.toMatchObject({ fields: { email: expect.any(String) } });
      expect(auth.save).not.toHaveBeenCalled();
      expect(user.email).toBe('someone@example.com');
    });

    it('accepts the current email sent back in any case', async () => {
      expect(
        await patchErrors(
          { email: ' SomeOne@Example.com ', description: 'x' },
          { passwordValid: false },
        ),
      ).toBeNull();
    });

    it('drops pending reset codes when the password changes', async () => {
      const { controller, auth } = makeController();

      await controller.patch(currentUser(), {
        password: 'current',
        new_password: 'longenough',
      } as never);

      expect(auth.dropRestoreCodes).toHaveBeenCalledWith(1);
    });

    it('rejects a taken username', async () => {
      expect(
        await patchErrors({ username: 'taken' }, { taken: 'username' }),
      ).toEqual({
        username: expect.any(String),
      });
    });

    it('rejects a username that fails the character rules', async () => {
      expect(await patchErrors({ username: 'ab' })).toEqual({
        username: expect.any(String),
      });
      expect(await patchErrors({ username: 'has spaces' })).toEqual({
        username: expect.any(String),
      });
    });

    it('rejects a short new password and an empty fullname', async () => {
      expect(await patchErrors({ new_password: 'abc' })).toEqual({
        new_password: expect.any(String),
      });
      expect(await patchErrors({ fullname: '' })).toEqual({
        fullname: expect.any(String),
      });
    });

    it('rejects an over-long description', async () => {
      expect(await patchErrors({ description: 'x'.repeat(513) })).toEqual({
        description: expect.any(String),
      });
    });

    it('reports every failing field at once', async () => {
      const fields = await patchErrors({
        username: 'ab',
        email: 'bad',
        fullname: '',
      });

      expect(Object.keys(fields ?? {}).sort()).toEqual([
        'email',
        'fullname',
        'username',
      ]);
    });

    it('writes a new password through the hashing path, not the entity', async () => {
      const { controller, auth } = makeController();

      await controller.patch(currentUser(), {
        new_password: 'longenough',
        password: 'pw',
      });

      expect(auth.setPassword).toHaveBeenCalledWith(1, 'longenough');
    });
  });

  describe('photo and cover', () => {
    it('rejects a missing id', async () => {
      const { controller } = makeController();

      await expect(controller.setPhoto(1, {})).rejects.toThrow(VaultException);
    });

    it('rejects a file that is not an image', async () => {
      const { controller } = makeController({
        findImage: jest.fn().mockResolvedValue(null),
      });

      await expect(controller.setPhoto(1, { id: 7 })).rejects.toThrow(
        VaultException,
      );
    });

    it('clears without validating an id', async () => {
      const { controller, auth } = makeController();

      await controller.deletePhoto(1);
      await controller.deleteCover(1);

      expect(auth.setPhoto).toHaveBeenCalledWith(1, null);
      expect(auth.setCover).toHaveBeenCalledWith(1, null);
    });
  });

  describe('restore', () => {
    it('404s an unknown account', async () => {
      const { controller } = makeController();

      await expect(
        controller.createRestoreCode({ field: 'nobody' }),
      ).rejects.toThrow(VaultException);
    });

    it('mails the code to the account address', async () => {
      const { controller, auth } = makeController({
        findByUsernameOrEmail: jest.fn().mockResolvedValue({
          id: 1,
          email: 'someone@example.com',
          username: 'someone',
        }),
      });

      await controller.createRestoreCode({ field: 'someone' });

      expect(auth.sendRestoreCode).toHaveBeenCalledWith(
        'someone@example.com',
        'someone',
        'code',
      );
    });

    it('rejects a short password before looking the code up', async () => {
      const { controller, auth } = makeController();

      await expect(
        controller.applyRestoreCode('code', { password: 'abc' }),
      ).rejects.toThrow(VaultException);
      expect(auth.findRestoreCode).not.toHaveBeenCalled();
    });

    it('drops every reset code after setting the password', async () => {
      const { controller, auth } = makeController({
        findRestoreCode: jest
          .fn()
          .mockResolvedValue({ id: 9, user: { id: 1 } }),
      });

      await controller.applyRestoreCode('code', { password: 'longenough' });

      expect(auth.setPassword).toHaveBeenCalledWith(1, 'longenough');
      expect(auth.dropRestoreCodes).toHaveBeenCalledWith(1);
    });
  });
});
