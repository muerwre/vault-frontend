import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ERROR_CODES,
  MAX_DESCRIPTION_LENGTH,
  MAX_FULLNAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PROFILE_ABOUT_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  USERNAME_REGEX,
} from '@vault/common/constants';

import { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';
import { RateLimiter } from '../../globals/rate-limiter';
import type { WireSelf } from '../../wire/serialize';

import { AuthRequiredGuard, Uid, WithUser, WithUserGuard } from './auth.guards';
import {
  AuthService,
  type WireRestoreUser,
  type WireUpdates,
} from './auth.service';
import { isSameEmail } from './email';
import { PasswordService } from './password.service';
import {
  parseAboutDisplay,
  parseNodesView,
  parseProfileInfo,
} from './profile-fields';

interface LoginBody {
  username?: string;
  password?: string;
}

interface PatchBody {
  username?: string;
  fullname?: string;
  password?: string;
  new_password?: string;
  email?: string;
  description?: string;
  about?: unknown;
  about_display?: unknown;
  info?: unknown;
  nodes_view?: unknown;
}

interface FileBody {
  id?: number;
}

const MINUTE_MS = 60 * 1000;

/** Failed logins allowed per client and per account. */
export const LOGIN_FAILURES_PER_IP = 20;
export const LOGIN_FAILURES_PER_ACCOUNT = 10;
const LOGIN_WINDOW_MS = 15 * MINUTE_MS;

/** Reset requests allowed per client and per account. */
export const RESTORES_PER_IP = 20;
export const RESTORES_PER_ACCOUNT = 5;
const RESTORE_WINDOW_MS = 60 * MINUTE_MS;

const tooManyAttempts = () =>
  new VaultException(
    ERROR_CODES.TooManyRequests,
    HttpStatus.TOO_MANY_REQUESTS,
    'Слишком много попыток, попробуйте позже',
  );

@Controller('auth')
export class AuthController {
  private readonly loginsByIp = new RateLimiter(
    LOGIN_FAILURES_PER_IP,
    LOGIN_WINDOW_MS,
  );
  private readonly loginsByName = new RateLimiter(
    LOGIN_FAILURES_PER_ACCOUNT,
    LOGIN_WINDOW_MS,
  );
  private readonly restoresByIp = new RateLimiter(
    RESTORES_PER_IP,
    RESTORE_WINDOW_MS,
  );
  private readonly restoresByAccount = new RateLimiter(
    RESTORES_PER_ACCOUNT,
    RESTORE_WINDOW_MS,
  );

  constructor(
    private readonly auth: AuthService,
    private readonly passwords: PasswordService,
  ) {}

  /**
   * Login. Wrong credentials answer 400, never 401 — a 401 makes clients drop
   * their session, which is wrong for a failed login attempt.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginBody,
    @Ip() ip = '',
  ): Promise<{ user: WireSelf; token: string }> {
    const username = String(body?.username ?? '');
    const account = username.toLowerCase();

    if (this.loginsByIp.isLimited(ip) || this.loginsByName.isLimited(account)) {
      throw tooManyAttempts();
    }

    const user = await this.auth.authenticate(username, body?.password ?? '');

    if (!user) {
      // Only failures count, so a user who signs in often is never slowed.
      this.loginsByIp.hit(ip);
      this.loginsByName.hit(account);

      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
        'Неверное имя пользователя или пароль',
      );
    }

    const self = await this.auth.getSelf(user.id);

    if (!self) {
      throw new VaultException(
        ERROR_CODES.CantLoadUser,
        HttpStatus.BAD_REQUEST,
      );
    }

    return { user: self, token: this.auth.signToken(user) };
  }

  /** Reading own profile also refreshes `last_seen`. */
  @Get()
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async getSelf(@Uid() uid: number): Promise<{ user: WireSelf }> {
    const user = await this.auth.getSelf(uid);

    if (!user) {
      throw new VaultException(
        ERROR_CODES.CantLoadUser,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await this.auth.touchLastSeen(uid);

    return { user };
  }

  @Get('updates')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  getUpdates(@WithUser() user: User): Promise<WireUpdates> {
    return this.auth.getUpdates(user);
  }

  /**
   * Partial profile update. Changing username or password requires the current
   * password; the email cannot be changed at all. Validation failures answer the `errors` envelope keyed by
   * the request's own field names.
   */
  @Patch()
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async patch(
    @WithUser() user: User,
    @Body() body: PatchBody,
  ): Promise<{ user: WireSelf }> {
    const data = body ?? {};
    const errors: Record<string, string> = {};

    const wantsSensitiveChange =
      data.new_password !== undefined ||
      (data.username !== undefined && data.username !== user.username);

    if (
      wantsSensitiveChange &&
      !(await this.passwords.verify(data.password ?? '', user.password))
    ) {
      errors.password = 'Неверный пароль';
    }

    if (data.username !== undefined && data.username !== user.username) {
      if (
        data.username.length < 3 ||
        data.username.length > MAX_USERNAME_LENGTH ||
        !USERNAME_REGEX.test(data.username)
      ) {
        errors.username = 'Некорректное имя пользователя';
      } else if (await this.auth.isUsernameTaken(data.username)) {
        errors.username = 'Это имя уже занято, выберите другое';
      }
    }

    // The email cannot be changed here: nothing would prove the new address
    // belongs to the user, and password resets trust it. Sending the current
    // one back is fine.
    if (data.email !== undefined && !isSameEmail(data.email, user.email)) {
      errors.email = 'Почту нельзя изменить';
    }

    if (data.new_password !== undefined) {
      if (
        data.new_password.length < MIN_PASSWORD_LENGTH ||
        data.new_password.length > MAX_PASSWORD_LENGTH
      ) {
        errors.new_password = 'Пароль должен быть не короче 6 символов';
      }
    }

    if (data.fullname !== undefined && data.fullname.length < 1) {
      errors.fullname = 'Слишком коротко';
    } else if (
      data.fullname !== undefined &&
      data.fullname.length > MAX_FULLNAME_LENGTH
    ) {
      errors.fullname = `Не длиннее ${MAX_FULLNAME_LENGTH} символов`;
    }

    if (
      data.description !== undefined &&
      data.description.length > MAX_DESCRIPTION_LENGTH
    ) {
      errors.description = `Не длиннее ${MAX_DESCRIPTION_LENGTH} символов`;
    }

    const info =
      data.info !== undefined ? parseProfileInfo(data.info) : undefined;

    if (info && 'error' in info) {
      errors.info = info.error;
    }

    const aboutDisplay =
      data.about_display !== undefined
        ? parseAboutDisplay(data.about_display)
        : undefined;

    if (aboutDisplay && 'error' in aboutDisplay) {
      errors.about_display = aboutDisplay.error;
    }

    const nodesView =
      data.nodes_view !== undefined
        ? parseNodesView(data.nodes_view)
        : undefined;

    if (nodesView && 'error' in nodesView) {
      errors.nodes_view = nodesView.error;
    }

    if (
      data.about !== undefined &&
      (typeof data.about !== 'string' ||
        data.about.length > MAX_PROFILE_ABOUT_LENGTH)
    ) {
      errors.about = 'Слишком длинно';
    }

    if (Object.keys(errors).length > 0) {
      throw new VaultValidationException(
        errors,
        HttpStatus.BAD_REQUEST,
        'Проверьте введённые данные',
      );
    }

    /**
     * Each field is applied independently — `description` and `fullname` in
     * particular must not be coupled.
     */
    if (data.description !== undefined) {
      user.description = data.description;
    }

    if (data.fullname !== undefined) {
      user.fullname = data.fullname;
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }

    await this.auth.saveSelf(user, {
      ...(typeof data.about === 'string' && { about: data.about }),
      ...(aboutDisplay &&
        'value' in aboutDisplay && {
          aboutDisplay: aboutDisplay.value,
        }),
      settings: {
        ...(info && 'value' in info && { info: info.value }),
        ...(nodesView &&
          'value' in nodesView && { nodes_view: nodesView.value }),
      },
    });

    if (data.new_password !== undefined) {
      await this.auth.setPassword(user.id, data.new_password);
      // A reset link mailed earlier must not undo the change.
      await this.auth.dropRestoreCodes(user.id);
    }

    return this.getSelf(user.id);
  }

  @Post('photo')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async setPhoto(
    @Uid() uid: number,
    @Body() body: FileBody,
  ): Promise<{ user: WireSelf }> {
    await this.auth.setPhoto(uid, await this.requireImageId(body));

    return this.getSelf(uid);
  }

  @Delete('photo')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async deletePhoto(@Uid() uid: number): Promise<{ user: WireSelf }> {
    await this.auth.setPhoto(uid, null);

    return this.getSelf(uid);
  }

  @Post('cover')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async setCover(
    @Uid() uid: number,
    @Body() body: FileBody,
  ): Promise<{ user: WireSelf }> {
    await this.auth.setCover(uid, await this.requireImageId(body));

    return this.getSelf(uid);
  }

  @Delete('cover')
  @UseGuards(AuthRequiredGuard, WithUserGuard)
  async deleteCover(@Uid() uid: number): Promise<{ user: WireSelf }> {
    await this.auth.setCover(uid, null);

    return this.getSelf(uid);
  }

  /**
   * Requests a reset code. Answers 201 with no body whether or not the account
   * exists is **not** the behaviour here — an unknown account is a 404, matching
   * the existing client.
   */
  @Post('restore')
  @HttpCode(HttpStatus.CREATED)
  async createRestoreCode(
    @Body() body: { field?: string },
    @Ip() ip = '',
  ): Promise<void> {
    // Before the lookup, so probing for accounts is slowed down too.
    if (!this.restoresByIp.take(ip)) {
      throw tooManyAttempts();
    }

    const field = body?.field ?? '';
    const user = field ? await this.auth.findByUsernameOrEmail(field) : null;

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    // Each request mails a new link; this keeps someone from flooding a mailbox.
    if (!this.restoresByAccount.take(String(user.id))) {
      throw tooManyAttempts();
    }

    const code = await this.auth.createRestoreCode(user.id);

    await this.auth.sendRestoreCode(user.email ?? '', user.username, code);
  }

  /** Answers 201, not 200 — the client relies on the existing status. */
  @Get('restore/:id')
  @HttpCode(HttpStatus.CREATED)
  async validateRestoreCode(
    @Param('id') id: string,
  ): Promise<{ user: WireRestoreUser }> {
    const found = await this.auth.findRestoreCode(id);

    if (!found) {
      throw new VaultException(ERROR_CODES.CodeIsInvalid, HttpStatus.NOT_FOUND);
    }

    return { user: this.auth.toRestoreUser(found.user) };
  }

  /** Consumes the code, sets the new password and issues a token. */
  @Put('restore/:id')
  async applyRestoreCode(
    @Param('id') id: string,
    @Body() body: { password?: string },
  ): Promise<{ user: WireSelf; token: string }> {
    const password = body?.password ?? '';

    if (!id || !password || password.length < MIN_PASSWORD_LENGTH) {
      throw new VaultException(
        ERROR_CODES.CodeIsInvalid,
        HttpStatus.NOT_FOUND,
        password && password.length < MIN_PASSWORD_LENGTH
          ? 'Пароль должен быть не короче 6 символов'
          : undefined,
      );
    }

    const found = await this.auth.findRestoreCode(id);

    if (!found) {
      throw new VaultException(ERROR_CODES.CodeIsInvalid, HttpStatus.NOT_FOUND);
    }

    await this.auth.setPassword(found.user.id, password);
    await this.auth.dropRestoreCodes(found.user.id);

    const self = await this.auth.getSelf(found.user.id);

    if (!self) {
      throw new VaultException(
        ERROR_CODES.CantLoadUser,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { user: self, token: this.auth.signToken(found.user) };
  }

  private async requireImageId(body: FileBody): Promise<number> {
    const id = Number(body?.id ?? 0);

    if (!Number.isFinite(id) || id <= 0 || !(await this.auth.findImage(id))) {
      throw new VaultException(
        ERROR_CODES.IncorrectData,
        HttpStatus.BAD_REQUEST,
        'Не удалось загрузить изображение, попробуйте ещё раз',
      );
    }

    return id;
  }
}
