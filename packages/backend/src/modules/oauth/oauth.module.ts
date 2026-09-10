import { Module, type Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  getGoogleOAuthConfig,
  getVkOAuthConfig,
  isOAuthProviderConfigured,
  type OAuthProviderConfig,
} from '../../config/env';
import { Social } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';

import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { GoogleStrategy } from './providers/google.strategy';
import { VkontakteStrategy } from './providers/vkontakte.strategy';

/**
 * Registers a strategy only when its credentials are present.
 *
 * Constructing one without a client id throws, and an unconfigured provider is
 * unusable anyway — its routes 404 at the guard. The factory defers the check
 * to injection time, once config has loaded.
 */
const strategyProvider = <T>(
  token: new () => T,
  readConfig: () => OAuthProviderConfig,
): Provider => ({
  provide: token,
  useFactory: () =>
    isOAuthProviderConfigured(readConfig()) ? new token() : null,
});

@Module({
  imports: [
    TypeOrmModule.forFeature([Social, User]),
    AuthModule,
    NotificationsModule,
    UploadModule,
  ],
  controllers: [OAuthController],
  /**
   * The strategies register themselves with passport on construction, so they
   * belong here even though nothing injects them — the guard resolves them by
   * name via the `:provider` route parameter.
   */
  providers: [
    OAuthService,
    strategyProvider(VkontakteStrategy, getVkOAuthConfig),
    strategyProvider(GoogleStrategy, getGoogleOAuthConfig),
  ],
})
export class OAuthModule {}
