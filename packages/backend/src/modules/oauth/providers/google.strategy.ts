import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAUTH_PROVIDERS } from '@vault/common/constants';
import { Strategy } from 'passport-oauth2';

import { getGoogleOAuthConfig } from '../../../config/env';
import type { ProviderProfile } from '../oauth.claim';

/**
 * Google OAuth2 with PKCE. `sub` is the stable account id — never the email,
 * which a user can change.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  OAUTH_PROVIDERS.GOOGLE,
) {
  private readonly logger = new Logger('OAuth/google');

  constructor() {
    const config = getGoogleOAuthConfig();

    super({
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackUrl,
      scope: ['openid', 'email', 'profile'],
      pkce: true,
      state: true,
    });
  }

  async userProfile(
    accessToken: string,
    done: (error: Error | null, profile?: ProviderProfile) => void,
  ): Promise<void> {
    try {
      const response = await fetch(
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const data = (await response.json()) as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
        error_description?: string;
      };

      if (!response.ok || !data?.sub) {
        done(
          new Error(data?.error_description ?? 'Google profile unavailable'),
        );
        return;
      }

      done(null, {
        provider: OAUTH_PROVIDERS.GOOGLE,
        id: data.sub,
        email: data.email ?? '',
        name: data.name ?? '',
        photo: data.picture ?? '',
      });
    } catch (error) {
      this.logger.warn(
        `profile fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      done(error instanceof Error ? error : new Error(String(error)));
    }
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: ProviderProfile,
  ): ProviderProfile {
    return profile;
  }
}
