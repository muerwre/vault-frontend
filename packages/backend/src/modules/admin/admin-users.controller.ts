import { Controller, Get, UseGuards } from '@nestjs/common';

import {
  AdminOnlyGuard,
  MembersOnlyGuard,
  WithUserGuard,
} from '../auth/auth.guards';

import { AdminUsersService, type WireAdminUser } from './admin-users.service';

/** Users, for the admin page. Anyone but an admin gets a 404. */
@Controller('admin/users')
@UseGuards(MembersOnlyGuard, WithUserGuard, AdminOnlyGuard)
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  async list(): Promise<{ users: WireAdminUser[] }> {
    return { users: await this.users.list() };
  }
}
