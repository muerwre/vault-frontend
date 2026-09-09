import { createHash, timingSafeEqual } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PASSWORD_PLACEHOLDER } from '@vault/common/constants';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';

/** Cost factor for newly written hashes. */
const BCRYPT_ROUNDS = 10;

const MD5_HEX = /^[0-9a-f]{32}$/i;

/**
 * Two hash formats coexist in `user.password`: bcrypt (`$2a$`/`$2b$`) and bare
 * unsalted MD5 hex. Both must keep validating.
 */
@Injectable()
export class PasswordService {
  private readonly logger = new Logger('Password');

  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Verifies a password against a stored hash of either format.
   *
   * An empty password or empty stored hash never matches, and the
   * `NO_PASSWORD` sentinel on OAuth-only accounts is rejected outright rather
   * than relying on it failing to parse as a hash.
   */
  async verify(password: string, stored: string): Promise<boolean> {
    if (!password || !stored || stored === PASSWORD_PLACEHOLDER) {
      return false;
    }

    if (MD5_HEX.test(stored)) {
      return this.matchesMd5(password, stored);
    }

    try {
      return await bcrypt.compare(password, stored);
    } catch {
      // A malformed hash is a failed login, not an error.
      return false;
    }
  }

  /** True when the stored hash is a legacy format that should be upgraded. */
  needsUpgrade(stored: string): boolean {
    return MD5_HEX.test(stored);
  }

  /**
   * Re-hashes a verified password with bcrypt and persists it.
   *
   * Call only after {@link verify} succeeded against a legacy hash — this is how
   * MD5 rows leave the database. Failure is logged and swallowed: the caller has
   * already authenticated, so a write problem must not fail their login.
   */
  async upgrade(userId: number, password: string): Promise<void> {
    try {
      await this.users.update(userId, { password: await this.hash(password) });
      this.logger.log(`upgraded password hash for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `could not upgrade password hash for user ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Unsalted `md5(password)`, hex, compared in constant time. */
  private matchesMd5(password: string, stored: string): boolean {
    const digest = createHash('md5').update(password, 'utf8').digest('hex');
    const a = Buffer.from(digest, 'utf8');
    const b = Buffer.from(stored.toLowerCase(), 'utf8');

    return a.length === b.length && timingSafeEqual(a, b);
  }
}
