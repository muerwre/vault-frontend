import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ERROR_CODES } from '@vault/common/constants';
import type { Request } from 'express';

import { VaultException } from '../../globals/exceptions';
import type { WireSelf } from '../../wire/serialize';
import {
  AdminOnlyGuard,
  MembersOnlyGuard,
  Uid,
  WithUserGuard,
} from '../auth/auth.guards';
import { AuthService } from '../auth/auth.service';

import {
  type Features,
  type RegistrationOutcome,
  RegistrationService,
  type WireRegistrationRequest,
} from './registration.service';

/** Public switches the frontend needs before rendering optional features. */
@Controller('features')
export class FeaturesController {
  constructor(private readonly registration: RegistrationService) {}

  @Get()
  get(): Features {
    return this.registration.getFeatures();
  }
}

@Controller('auth/register')
export class RegistrationController {
  constructor(
    private readonly registration: RegistrationService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Answers the same whether or not the address already has an account; only
   * the approval setting changes what the guest is told.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async request(
    @Req() request: Request,
    @Body() body: { email?: unknown; reason?: unknown },
  ): Promise<{ status: RegistrationOutcome }> {
    const status = await this.registration.request(
      body?.email,
      body?.reason,
      request.ip ?? '',
    );

    return { status };
  }

  @Get(':code')
  check(@Param('code') code: string): Promise<{ email: string }> {
    return this.registration.checkCode(code);
  }

  /** Creates the account and signs it in, like a password restore does. */
  @Put(':code')
  async complete(
    @Param('code') code: string,
    @Body() body: { username?: unknown; password?: unknown },
  ): Promise<{ user: WireSelf; token: string }> {
    const user = await this.registration.complete(
      code,
      body?.username,
      body?.password,
    );
    const self = await this.auth.getSelf(user.id);

    if (!self) {
      throw new VaultException(
        ERROR_CODES.CantLoadUser,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { user: self, token: this.auth.signToken(user) };
  }
}

/** Registration requests, for the admin page. Anyone but an admin gets a 404. */
@Controller('admin/registrations')
@UseGuards(MembersOnlyGuard, WithUserGuard, AdminOnlyGuard)
export class AdminRegistrationsController {
  constructor(private readonly registration: RegistrationService) {}

  @Get()
  async list(): Promise<{ requests: WireRegistrationRequest[] }> {
    return { requests: await this.registration.list() };
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Uid() uid: number,
  ): Promise<{ request: WireRegistrationRequest }> {
    return { request: await this.registration.approve(id, uid) };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Uid() uid: number,
  ): Promise<{ request: WireRegistrationRequest }> {
    return { request: await this.registration.reject(id, uid) };
  }

  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  async resend(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ request: WireRegistrationRequest }> {
    return { request: await this.registration.resend(id) };
  }
}
