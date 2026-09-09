import { createHash } from 'crypto';

import * as bcrypt from 'bcryptjs';
import type { Repository } from 'typeorm';

import type { User } from '../../entities/user.entity';

import { PasswordService } from './password.service';

const md5 = (value: string) =>
  createHash('md5').update(value, 'utf8').digest('hex');

describe('PasswordService', () => {
  let users: { update: jest.Mock };
  let service: PasswordService;

  beforeEach(() => {
    users = { update: jest.fn().mockResolvedValue(undefined) };
    service = new PasswordService(users as unknown as Repository<User>);
  });

  describe('verify', () => {
    it('accepts a $2b$ bcrypt hash', async () => {
      const hash = await bcrypt.hash('secret', 4);

      await expect(service.verify('secret', hash)).resolves.toBe(true);
      await expect(service.verify('wrong', hash)).resolves.toBe(false);
    });

    /** The majority of stored bcrypt hashes use the $2a$ prefix. */
    it('accepts a $2a$ bcrypt hash', async () => {
      const hash = (await bcrypt.hash('secret', 4)).replace('$2b$', '$2a$');

      await expect(service.verify('secret', hash)).resolves.toBe(true);
    });

    it('accepts a legacy unsalted MD5 hash', async () => {
      await expect(service.verify('hunter2', md5('hunter2'))).resolves.toBe(true);
      await expect(service.verify('nope', md5('hunter2'))).resolves.toBe(false);
    });

    it('accepts an uppercase MD5 hash', async () => {
      await expect(
        service.verify('hunter2', md5('hunter2').toUpperCase()),
      ).resolves.toBe(true);
    });

    it('rejects the OAuth-only sentinel whatever is supplied', async () => {
      await expect(service.verify('NO_PASSWORD', 'NO_PASSWORD')).resolves.toBe(
        false,
      );
      await expect(service.verify('anything', 'NO_PASSWORD')).resolves.toBe(false);
    });

    it('rejects empty input and empty stored hashes', async () => {
      const hash = await bcrypt.hash('secret', 4);

      await expect(service.verify('', hash)).resolves.toBe(false);
      await expect(service.verify('secret', '')).resolves.toBe(false);
    });

    it('treats a malformed hash as a failed login rather than throwing', async () => {
      await expect(service.verify('secret', '$2b$not-a-hash')).resolves.toBe(
        false,
      );
    });
  });

  describe('needsUpgrade', () => {
    it('flags MD5 and not bcrypt', async () => {
      expect(service.needsUpgrade(md5('x'))).toBe(true);
      expect(service.needsUpgrade(await bcrypt.hash('x', 4))).toBe(false);
      expect(service.needsUpgrade('NO_PASSWORD')).toBe(false);
    });
  });

  describe('upgrade', () => {
    it('persists a bcrypt hash of the verified password', async () => {
      await service.upgrade(42, 'hunter2');

      expect(users.update).toHaveBeenCalledTimes(1);
      const [id, patch] = users.update.mock.calls[0] as [number, { password: string }];
      expect(id).toBe(42);
      expect(patch.password.startsWith('$2')).toBe(true);
      await expect(bcrypt.compare('hunter2', patch.password)).resolves.toBe(true);
    });

    /** The caller has already authenticated, so a write failure must not throw. */
    it('swallows a write failure', async () => {
      users.update.mockRejectedValue(new Error('db down'));

      await expect(service.upgrade(42, 'hunter2')).resolves.toBeUndefined();
    });
  });

  describe('hash', () => {
    it('produces a verifiable bcrypt hash', async () => {
      const hash = await service.hash('secret');

      expect(hash.startsWith('$2')).toBe(true);
      await expect(bcrypt.compare('secret', hash)).resolves.toBe(true);
    });
  });
});
