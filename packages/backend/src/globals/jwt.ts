import { JwtModule } from '@nestjs/jwt';

import { loadConfig } from '../config/env';

loadConfig();

/**
 * JWT signing, matching the Go backend exactly.
 *
 * **No `expiresIn`.** Go issued tokens without an `exp` claim, so every token in
 * the wild is non-expiring; adding an expiry here would invalidate all of them
 * and log every user out. HS256 is the default algorithm and matches Go's.
 *
 * Claims are `{ uid, nme, rol, iat }` — see `ITokenClaims` in @vault/common.
 */
export const JWT = JwtModule.register({
  global: true,
  secret: process.env.JWT_SECRET,
  signOptions: {
    algorithm: 'HS256',
  },
  verifyOptions: {
    algorithms: ['HS256'],
    /**
     * Tokens have no `exp`; without this, `jsonwebtoken` is fine, but being
     * explicit documents that expiry is intentionally not enforced.
     */
    ignoreExpiration: true,
  },
});
