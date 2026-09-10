import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES, OAUTH_PROVIDERS } from '@vault/common/constants';
import type { Request, Response } from 'express';

import { getTelegramToken } from '../../config/env';
import { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';
import {
  AuthRequiredGuard,
  Uid,
  WithUser,
  WithUserGuard,
} from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';
import { NotificationsService } from '../notifications/notifications.service';

import type { ProviderProfile } from './oauth.claim';
import { ProviderAuthGuard, ProviderCallbackGuard } from './oauth.guards';
import { renderPopupSuccess } from './oauth.popup';
import { OAuthPopupErrorFilter } from './oauth.popup-filter';
import { OAuthService, toWireSocial, type WireSocial } from './oauth.service';
import { validateSocialRegister } from './oauth.validation';
import {
  isTelegramHashValid,
  telegramAccountName,
  type TelegramAuthPayload,
} from './telegram.hash';

interface ClaimBody {
  token?: string;
  username?: string;
  password?: string;
}

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauth: OAuthService,
    private readonly auth: AuthService,
    private readonly notifications: NotificationsService,
  ) {}

  /** The caller's linked accounts. */
  @Get()
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async list(@WithUser() user: User): Promise<{ accounts: WireSocial[] }> {
    const accounts = await this.oauth.socialsOfUser(user.id);

    return { accounts: accounts.map(toWireSocial) };
  }

  /**
   * Links the account described by a claim token to the caller.
   *
   * Re-attaching an account the caller already has is a no-op success; one that
   * belongs to somebody else is a conflict.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async attach(
    @WithUser() user: User,
    @Body() body: ClaimBody,
  ): Promise<{ account: WireSocial }> {
    const claim = this.requireClaim(body?.token);
    const existing = await this.oauth.findSocial(claim.provider, claim.id);

    if (existing) {
      if (existing.userId !== user.id) {
        throw new VaultException(
          ERROR_CODES.OAuthConflict,
          HttpStatus.CONFLICT,
          'Этот аккаунт уже привязан к другому пользователю',
        );
      }

      // Refresh the stored name and avatar while we have them.
      const updated = await this.oauth.updateSocial(
        existing,
        claim.name,
        claim.photo,
      );

      return { account: toWireSocial(updated) };
    }

    await this.refuseIfEmailBelongsToAnotherUser(claim.email, user.id);

    const created = await this.oauth.createSocial(
      claim.provider,
      claim.id,
      claim.name,
      claim.photo,
      user.id,
    );

    return { account: toWireSocial(created) };
  }

  /**
   * Logs in with a linked account, or registers a new one.
   *
   * A claim whose account is already linked logs that user straight in.
   * Otherwise registration details are required, and their absence is reported
   * as **428** — which is how the frontend knows to show the signup form.
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: ClaimBody): Promise<{ token: string }> {
    const claim = this.requireClaim(body?.token);
    const existing = await this.oauth.findSocial(claim.provider, claim.id);

    if (existing?.user) {
      await this.oauth.updateSocial(existing, claim.name, claim.photo);

      return { token: this.auth.signToken(existing.user) };
    }

    if (claim.email && (await this.oauth.findUserByEmail(claim.email))) {
      throw new VaultException(
        ERROR_CODES.OAuthConflict,
        HttpStatus.CONFLICT,
        'Аккаунт с этим адресом уже существует — войдите и привяжите профиль',
      );
    }

    const username = String(body?.username ?? '');
    const password = String(body?.password ?? '');
    const invalid = validateSocialRegister({ username, password });

    if (invalid) {
      throw new VaultValidationException(
        invalid,
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    if (await this.oauth.findUserByUsername(username)) {
      throw new VaultValidationException(
        { username: 'Это имя уже занято' },
        HttpStatus.PRECONDITION_REQUIRED,
      );
    }

    const user = await this.oauth.register(claim, username, password);

    await this.oauth.createSocial(
      claim.provider,
      claim.id,
      claim.name,
      claim.photo,
      user.id,
    );

    const token = this.auth.signToken(user);

    // Best-effort, and after the account exists: a failed avatar copy must not
    // cost the user their registration.
    await this.oauth.adoptProviderPhoto(user, claim.photo);

    return { token };
  }

  /**
   * Links a Telegram account from the login widget's payload.
   *
   * The payload is signed by the bot token rather than exchanged for a code, so
   * this provider has no redirect handshake.
   */
  @Post('telegram/attach')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async attachTelegram(
    @WithUser() user: User,
    @Body() body: TelegramAuthPayload,
  ): Promise<{ account: WireSocial }> {
    if (!isTelegramHashValid(body ?? {}, getTelegramToken())) {
      throw new VaultException(
        ERROR_CODES.OAuthInvalidData,
        HttpStatus.BAD_REQUEST,
        'Не удалось проверить данные Telegram',
      );
    }

    const accountId = String(body.id ?? '');
    const name = telegramAccountName(body);
    const photo = body.photo_url ?? '';

    const existing = await this.oauth.findSocial(
      OAUTH_PROVIDERS.TELEGRAM,
      accountId,
    );

    if (existing && existing.userId !== user.id) {
      throw new VaultException(
        ERROR_CODES.OAuthConflict,
        HttpStatus.CONFLICT,
        'Этот аккаунт Telegram уже привязан к другому пользователю',
      );
    }

    const account = existing
      ? await this.oauth.updateSocial(existing, name, photo)
      : await this.oauth.createSocial(
          OAUTH_PROVIDERS.TELEGRAM,
          accountId,
          name,
          photo,
          user.id,
        );

    // Linking Telegram opts the user into Telegram delivery.
    await this.notifications.updateSettings(user.id, { send_telegram: true });

    return { account: toWireSocial(account) };
  }

  /** Unlinks Telegram and stops Telegram delivery. */
  @Delete('telegram/:id')
  @UseGuards(AuthRequiredGuard)
  async deleteTelegram(
    @Uid() uid: number,
    @Param('id') id: string,
  ): Promise<void> {
    await this.oauth.deleteSocial(uid, OAUTH_PROVIDERS.TELEGRAM, id);
    await this.notifications.updateSettings(uid, { send_telegram: false });
  }

  /**
   * Starts the handshake. The guard hands off to the provider, so this body
   * never runs — it exists to declare the route.
   */
  @Get(':provider/redirect')
  @UseGuards(ProviderAuthGuard)
  redirect(): void {
    return undefined;
  }

  /**
   * Where the provider sends the user back. Runs inside the popup the frontend
   * opened, so it answers with HTML that posts the claim token to the opener.
   */
  @Get(':provider/process')
  @UseFilters(OAuthPopupErrorFilter)
  @UseGuards(ProviderCallbackGuard)
  process(
    @Req() request: Request & { user?: ProviderProfile },
    @Res() response: Response,
  ): void {
    const profile = request.user;

    if (!profile?.id) {
      throw new VaultException(ERROR_CODES.OAuthInvalidData);
    }

    response
      .status(HttpStatus.OK)
      .type('html')
      .send(renderPopupSuccess(this.oauth.encodeClaim(profile)));
  }

  /** Unlinks any other provider. */
  @Delete(':provider/:id')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async remove(
    @WithUser() user: User,
    @Param('provider') provider: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.oauth.deleteSocial(user.id, provider, id);
  }

  private requireClaim(token: unknown) {
    const claim = this.oauth.decodeClaim(token);

    if (!claim) {
      throw new VaultException(
        ERROR_CODES.OAuthInvalidData,
        HttpStatus.BAD_REQUEST,
      );
    }

    return claim;
  }

  /**
   * A provider email already registered to somebody else means the accounts
   * should be merged by logging in, not linked here.
   */
  private async refuseIfEmailBelongsToAnotherUser(
    email: string,
    userId: number,
  ): Promise<void> {
    if (!email) {
      return;
    }

    const owner = await this.oauth.findUserByEmail(email);

    if (owner && owner.id !== userId) {
      throw new VaultException(
        ERROR_CODES.OAuthConflict,
        HttpStatus.CONFLICT,
        'Аккаунт с этим адресом уже существует',
      );
    }
  }
}
