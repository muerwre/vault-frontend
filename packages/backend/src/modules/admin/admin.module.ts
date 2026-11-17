import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities/user.entity';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

/** The admin page's own endpoints, apart from those of the features it shows. */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminModule {}
