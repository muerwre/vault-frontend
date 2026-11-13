import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Node } from '../../entities/node.entity';
import { User } from '../../entities/user.entity';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Node])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
