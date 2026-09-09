import { HttpStatus } from '@nestjs/common';

import type { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';

import { AuthController } from './auth.controller';
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
    findByUsername: jest.fn().mockResolvedValue(null),
    findByEmail: jest.fn().mockResolvedValue(null),
    findByUsernameOrEmail: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation(async (user: User) => user),
    setPassword: jest.fn().mockResolvedValue(undefined),
    setPhoto: jest.fn().mockResolvedValue(undefined),
    setCover: jest.fn().mockResolvedValue(undefined),
    findImage: jest.fn().mockResolvedValue({ id: 5 }),
    findOrCreateRestoreCode: jest.fn().mockResolvedValue('code'),
    sendRestoreCode: jest.fn().mockResolvedValue(undefined),
    findRestoreCode: jest.fn().mockResolvedValue(null),
    consumeRestoreCode: jest.fn().mockResolvedValue(undefined),
    toRestoreUser: jest.fn().mockReturnValue({ username: 'someone', photo: null }),
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

      await expect(controller.login({ username: 'x', password: 'y' })).rejects.toThrow(
        VaultException,
      );

      try {
        await controller.login({ username: 'x', password: 'y' });
      } catch (error) {
        expect((error as VaultException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect((error as VaultException).code).toBe('Incorrect_Data');
      }
    });

    it('tolerates a missing body', async () => {
      const { controller, auth } = makeController();

      await controller.login({} as never);

      expect(auth.authenticate).toHaveBeenCalledWith('', '');
    });
  });

  describe('patch', () => {
    const patchErrors = async (
      body: Record<string, unknown>,
      opts: { passwordValid?: boolean; taken?: 'username' | 'email' } = {},
    ) => {
      const overrides: AuthMock = {};
      if (opts.taken === 'username') {
        overrides.findByUsername = jest.fn().mockResolvedValue({ id: 2 });
      }
      if (opts.taken === 'email') {
        overrides.findByEmail = jest.fn().mockResolvedValue({ id: 2 });
      }

      const { controller } = makeController(overrides, opts.passwordValid ?? true);

      try {
        await controller.patch(currentUser(), body as never);
        return null;
      } catch (error) {
        return (error as VaultValidationException).fields;
      }
    };

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

    it('requires the current password for an email change', async () => {
      expect(await patchErrors({ email: 'new@example.com' }, { passwordValid: false })).toEqual(
        { password: expect.any(String) },
      );
    });

    it('requires the current password for a username change', async () => {
      expect(await patchErrors({ username: 'newname' }, { passwordValid: false })).toEqual(
        { password: expect.any(String) },
      );
    });

    it('requires the current password for a password change', async () => {
      expect(
        await patchErrors({ new_password: 'longenough' }, { passwordValid: false }),
      ).toEqual({ password: expect.any(String) });
    });

    it('does not require a password for description or fullname', async () => {
      expect(
        await patchErrors({ description: 'x', fullname: 'y' }, { passwordValid: false }),
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

    it('rejects a taken username and a taken email', async () => {
      expect(await patchErrors({ username: 'taken' }, { taken: 'username' })).toEqual({
        username: expect.any(String),
      });
      expect(await patchErrors({ email: 'taken@example.com' }, { taken: 'email' })).toEqual(
        { email: expect.any(String) },
      );
    });

    it('rejects a username that fails the character rules', async () => {
      expect(await patchErrors({ username: 'ab' })).toEqual({
        username: expect.any(String),
      });
      expect(await patchErrors({ username: 'has spaces' })).toEqual({
        username: expect.any(String),
      });
    });

    it('rejects a malformed email', async () => {
      expect(await patchErrors({ email: 'not-an-email' })).toEqual({
        email: expect.any(String),
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
      const fields = await patchErrors({ username: 'ab', email: 'bad', fullname: '' });

      expect(Object.keys(fields ?? {}).sort()).toEqual([
        'email',
        'fullname',
        'username',
      ]);
    });

    it('writes a new password through the hashing path, not the entity', async () => {
      const { controller, auth } = makeController();

      await controller.patch(currentUser(), { new_password: 'longenough', password: 'pw' });

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

      await expect(controller.setPhoto(1, { id: 7 })).rejects.toThrow(VaultException);
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

      await expect(controller.createRestoreCode({ field: 'nobody' })).rejects.toThrow(
        VaultException,
      );
    });

    it('mails the code to the account address', async () => {
      const { controller, auth } = makeController({
        findByUsernameOrEmail: jest.fn().mockResolvedValue({
          id: 1,
          email: 'someone@example.com',
        }),
      });

      await controller.createRestoreCode({ field: 'someone' });

      expect(auth.sendRestoreCode).toHaveBeenCalledWith('someone@example.com', 'code');
    });

    it('rejects a short password before looking the code up', async () => {
      const { controller, auth } = makeController();

      await expect(
        controller.applyRestoreCode('code', { password: 'abc' }),
      ).rejects.toThrow(VaultException);
      expect(auth.findRestoreCode).not.toHaveBeenCalled();
    });

    it('consumes the code after setting the password', async () => {
      const { controller, auth } = makeController({
        findRestoreCode: jest.fn().mockResolvedValue({ id: 9, user: { id: 1 } }),
      });

      await controller.applyRestoreCode('code', { password: 'longenough' });

      expect(auth.setPassword).toHaveBeenCalledWith(1, 'longenough');
      expect(auth.consumeRestoreCode).toHaveBeenCalledWith(9);
    });
  });
});
