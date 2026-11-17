import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Social } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

/** The admin page's own endpoints, apart from those of the features it shows. */
@Module({
  imports: [TypeOrmModule.forFeature([User, Social])],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminModule {}
