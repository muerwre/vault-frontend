import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ERROR_CODES, OAUTH_PROVIDERS } from '@vault/common/constants';
import type { Request } from 'express';

import {
  getGoogleOAuthConfig,
  getVkOAuthConfig,
  isOAuthProviderConfigured,
} from '../../config/env';
import { VaultException } from '../../globals/exceptions';

/**
 * A provider takes part in the redirect handshake only when its credentials are
 * present, so an unconfigured deployment cannot start a flow it can't finish.
 */
export const isProviderEnabled = (provider: string): boolean => {
  switch (provider) {
    case OAUTH_PROVIDERS.VKONTAKTE:
      return isOAuthProviderConfigured(getVkOAuthConfig());
    case OAUTH_PROVIDERS.GOOGLE:
      return isOAuthProviderConfigured(getGoogleOAuthConfig());
    default:
      return false;
  }
};

/**
 * Delegates to the passport strategy named by the `:provider` route parameter.
 *
 * Both legs of the handshake go through this: on `/redirect` passport has no
 * code yet and answers with a redirect to the provider, and on `/process` it
 * completes the exchange and populates `request.user`.
 */
@Injectable()
export class ProviderAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provider = String(request.params?.provider ?? '');

    if (!isProviderEnabled(provider)) {
      throw new VaultException(
        ERROR_CODES.OAuthUnknownProvider,
        HttpStatus.NOT_FOUND,
      );
    }

    const guard = new (AuthGuard(provider))();

    return guard.canActivate(context) as Promise<boolean> | boolean;
  }
}

/**
 * The callback leg. Refuses a request carrying no `code` before passport sees
 * it — passport would otherwise read that as "start a new flow" and redirect
 * back to the provider, looping instead of reporting the failure.
 */
@Injectable()
export class ProviderCallbackGuard extends ProviderAuthGuard {
  canActivate(context: ExecutionContext): Promise<boolean> | boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.query?.code) {
      throw new VaultException(
        ERROR_CODES.OAuthCodeIsEmpty,
        HttpStatus.BAD_REQUEST,
      );
    }

    return super.canActivate(context);
  }
}
