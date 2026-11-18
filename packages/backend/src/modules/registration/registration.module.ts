import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationRequest } from '../../entities/registration-request.entity';
import { User } from '../../entities/user.entity';

import {
  AdminRegistrationsController,
  FeaturesController,
  RegistrationController,
} from './registration.controller';
import { RegistrationService } from './registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistrationRequest, User])],
  controllers: [
    FeaturesController,
    RegistrationController,
    AdminRegistrationsController,
  ],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
