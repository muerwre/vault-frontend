import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ERROR_CODES,
  MIN_PASSWORD_LENGTH,
  USERNAME_REGEX,
} from '@vault/common/constants';

import { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';
import type { WireSelf } from '../../wire/serialize';

import { AuthRequiredGuard, Uid, WithUser, WithUserGuard } from './auth.guards';
import { AuthService, type WireRestoreUser } from './auth.service';
import { PasswordService } from './password.service';

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
}

interface FileBody {
  id?: number;
}

const MAX_USERNAME_LENGTH = 64;
const MAX_FULLNAME_LENGTH = 64;
const MAX_PASSWORD_LENGTH = 64;
const MAX_DESCRIPTION_LENGTH = 512;

@Controller('auth')
export class AuthController {
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
  ): Promise<{ user: WireSelf; token: string }> {
    const user = await this.auth.authenticate(
      body?.username ?? '',
      body?.password ?? '',
    );

    if (!user) {
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
  @UseGuards(AuthRequiredGuard)
  getUpdates(): Promise<{ boris: { commented_at: string } }> {
    return this.auth.getUpdates();
  }

  /**
   * Partial profile update. Changing username, email or password requires the
   * current password. Validation failures answer the `errors` envelope keyed by
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
      (data.email !== undefined && data.email !== user.email) ||
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
      } else if (await this.auth.findByUsername(data.username)) {
        errors.username = 'Это имя уже занято, выберите другое';
      }
    }

    if (data.email !== undefined && data.email !== user.email) {
      if (!data.email.includes('@') || data.email.length < 2) {
        errors.email = 'Не похоже на email';
      } else if (await this.auth.findByEmail(data.email)) {
        errors.email = 'Этот email уже используется, выберите другой';
      }
    }

    if (data.new_password !== undefined) {
      if (
        data.new_password.length < MIN_PASSWORD_LENGTH ||
        data.new_password.length > MAX_PASSWORD_LENGTH
      ) {
        errors.new_password = 'Пароль должен быть не короче 6 символов';
      }
    }

    if (
      data.fullname !== undefined &&
      (data.fullname.length < 1 || data.fullname.length > MAX_FULLNAME_LENGTH)
    ) {
      errors.fullname = 'Слишком коротко';
    }

    if (
      data.description !== undefined &&
      data.description.length > MAX_DESCRIPTION_LENGTH
    ) {
      errors.description = 'Слишком длинно';
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

    if (data.email !== undefined) {
      user.email = data.email;
    }

    if (data.username !== undefined) {
      user.username = data.username;
    }

    await this.auth.save(user);

    if (data.new_password !== undefined) {
      await this.auth.setPassword(user.id, data.new_password);
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
  async createRestoreCode(@Body() body: { field?: string }): Promise<void> {
    const field = body?.field ?? '';
    const user = field ? await this.auth.findByUsernameOrEmail(field) : null;

    if (!user) {
      throw new VaultException(ERROR_CODES.UserNotFound, HttpStatus.NOT_FOUND);
    }

    const code = await this.auth.findOrCreateRestoreCode(user.id);

    await this.auth.sendRestoreCode(user.email, code);
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
    await this.auth.consumeRestoreCode(found.id);

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
