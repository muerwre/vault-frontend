import { Global, Module } from '@nestjs/common';

import { TelegramTransport } from './telegram.transport';

/**
 * Bot API access. Global so the notification sender can reach it without
 * threading the module through every consumer.
 */
@Global()
@Module({
  providers: [TelegramTransport],
  exports: [TelegramTransport],
})
export class TelegramModule {}
