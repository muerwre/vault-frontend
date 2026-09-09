import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { RestoreCode } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';
import { NodeView } from '../../entities/views.entity';
import { MailModule } from '../mail/mail.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import {
  AuthRequiredGuard,
  OptionalAuthGuard,
  TokenReader,
  WithUserGuard,
} from './auth.guards';

/**
 * Global so any feature module can `@UseGuards(AuthRequiredGuard)` without
 * re-importing the guards and their dependencies.
 *
 * `TypeOrmModule.forFeature([User])` is **exported**, not just imported: a guard
 * referenced by class in `@UseGuards()` is instantiated in the *consuming*
 * module's injector, so `WithUserGuard`'s `UserRepository` has to be resolvable
 * there too. Without the re-export, every module that uses `WithUserGuard` fails
 * to boot with an UnknownDependenciesException.
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, File, Node, NodeView, RestoreCode]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    TokenReader,
    OptionalAuthGuard,
    AuthRequiredGuard,
    WithUserGuard,
    PasswordService,
    AuthService,
  ],
  exports: [
    TypeOrmModule,
    TokenReader,
    OptionalAuthGuard,
    AuthRequiredGuard,
    WithUserGuard,
    PasswordService,
    AuthService,
  ],
})
export class AuthModule {}
