import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Node } from '../../entities/node.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { NodeModule } from '../node/node.module';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, Node]), NodeModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
