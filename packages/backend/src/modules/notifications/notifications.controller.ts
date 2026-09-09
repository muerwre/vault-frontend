import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { AuthRequiredGuard, Uid } from '../auth/auth.guards';

import {
  NotificationsService,
  type SettingsPatch,
  type WireNotificationItem,
  type WireNotificationSettings,
} from './notifications.service';

/** Clients call `/notifications/` with a trailing slash. */
@Controller('notifications')
@UseGuards(AuthRequiredGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@Uid() uid: number): Promise<{ items: WireNotificationItem[] }> {
    return { items: await this.notifications.list(uid) };
  }

  @Get('settings')
  getSettings(@Uid() uid: number): Promise<WireNotificationSettings> {
    return this.respondWithSettings(uid);
  }

  /** Partial update: absent fields keep their stored value. Answers 200. */
  @Post('settings')
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Uid() uid: number,
    @Body() body: SettingsPatch,
  ): Promise<WireNotificationSettings> {
    await this.notifications.updateSettings(uid, body ?? {});

    return this.respondWithSettings(uid);
  }

  private async respondWithSettings(
    uid: number,
  ): Promise<WireNotificationSettings> {
    const [settings, lastDate] = await Promise.all([
      this.notifications.getSettings(uid),
      this.notifications.getLastDate(uid),
    ]);

    return this.notifications.toWireSettings(settings, lastDate);
  }
}
