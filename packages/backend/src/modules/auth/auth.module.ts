import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../entities/user.entity';

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
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TokenReader, OptionalAuthGuard, AuthRequiredGuard, WithUserGuard],
  exports: [
    TypeOrmModule,
    TokenReader,
    OptionalAuthGuard,
    AuthRequiredGuard,
    WithUserGuard,
  ],
})
export class AuthModule {}
