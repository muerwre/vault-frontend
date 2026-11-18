import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  AdminOnlyGuard,
  MembersOnlyGuard,
  Uid,
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

  /** Soft delete; see the service for what it ends and keeps. */
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Uid() uid: number,
  ): Promise<void> {
    await this.users.softDelete(id, uid);
  }
}
