import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OAUTH_PROVIDERS } from '@vault/common/constants';
import type { Request as ExpressRequest } from 'express';
import { Strategy } from 'passport-oauth2';

import { getVkOAuthConfig } from '../../../config/env';
import type { ProviderProfile } from '../oauth.claim';

/**
 * VK ID (`id.vk.com`) with PKCE — the current flow. The older `oauth.vk.com`
 * endpoints this backend used before are deprecated.
 *
 * Two things are easy to get wrong:
 * - `pkce` and `state` must both be on, which is why the OAuth routes need a
 *   session: the code verifier has to outlive the redirect to VK.
 * - VK requires `device_id` on the token exchange. It arrives as a query
 *   parameter on the callback, so it is read there and threaded through.
 *
 * Docs: https://id.vk.com/about/business/go/docs/en/vkid/latest/vk-id/connection/start-integration/how-auth-works/auth-flow-web
 */
@Injectable()
export class VkontakteStrategy extends PassportStrategy(
  Strategy,
  OAUTH_PROVIDERS.VKONTAKTE,
) {
  private readonly logger = new Logger('OAuth/vkontakte');

  constructor() {
    const config = getVkOAuthConfig();

    super({
      authorizationURL: 'https://id.vk.com/authorize',
      tokenURL: 'https://id.vk.com/oauth2/auth',
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackUrl,
      scope: ['email'],
      pkce: true,
      state: true,
    });
  }

  /** VK's profile call is a POST to `user_info`, not the default GET. */
  async userProfile(
    accessToken: string,
    done: (error: Error | null, profile?: ProviderProfile) => void,
  ): Promise<void> {
    try {
      const response = await fetch('https://id.vk.com/oauth2/user_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: getVkOAuthConfig().clientId,
          access_token: accessToken,
        }),
      });

      const data = (await response.json()) as {
        user?: {
          user_id?: string;
          first_name?: string;
          last_name?: string;
          avatar?: string;
          email?: string;
        };
        error_description?: string;
        error?: string;
      };

      if (!response.ok || !data?.user?.user_id) {
        done(
          new Error(
            data?.error_description ?? data?.error ?? 'VK profile unavailable',
          ),
        );
        return;
      }

      const { user } = data;

      done(null, {
        provider: OAUTH_PROVIDERS.VKONTAKTE,
        id: String(user.user_id),
        email: user.email ?? '',
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        photo: user.avatar ?? '',
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

  tokenParams(options: { device_id?: string }): Record<string, unknown> {
    return {
      device_id: options.device_id,
      ...(super.tokenParams(options) as Record<string, unknown>),
    };
  }

  authenticate(req: ExpressRequest, options?: unknown): void {
    const deviceId = req.query?.device_id;

    return super.authenticate(
      req,
      typeof deviceId === 'string'
        ? { ...(options as object), device_id: deviceId }
        : options,
    );
  }
}
