import { JwtModule } from '@nestjs/jwt';

import { loadConfig } from '../config/env';

loadConfig();

/**
 * Claims are `{ uid, nme, rol, iat }` (`ITokenClaims`).
 *
 * **Never add `expiresIn`.** Issued tokens carry no `exp` and are expected to
 * live forever; introducing one invalidates every token in the wild.
 */
export const JWT = JwtModule.register({
  global: true,
  secret: process.env.JWT_SECRET,
  signOptions: {
    algorithm: 'HS256',
  },
  verifyOptions: {
    algorithms: ['HS256'],
    // Expiry is intentionally not enforced.
    ignoreExpiration: true,
  },
});
