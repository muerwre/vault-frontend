import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FILE_TYPES,
  OAUTH_PROVIDERS,
  ROLES,
  UPLOAD_TARGETS,
  type OAuthProvider,
} from '@vault/common/constants';
import { Repository } from 'typeorm';

import { Social } from '../../entities/social.entity';
import { User } from '../../entities/user.entity';
import { toWireString } from '../../wire/serialize';
import { PasswordService } from '../auth/password.service';
import { UploadService } from '../upload/upload.service';

import {
  isOAuthClaim,
  toClaim,
  type OAuthClaim,
  type ProviderProfile,
} from './oauth.claim';

/** `{ provider, id, name, photo }` — DB `id` and `userId` never leave. */
export interface WireSocial {
  provider: string;
  id: string;
  name: string;
  photo: string;
}

export const toWireSocial = (social: Social): WireSocial => ({
  provider: social.provider,
  id: toWireString(social.accountId),
  name: toWireString(social.accountName),
  photo: toWireString(social.accountPhoto),
});

@Injectable()
export class OAuthService {
  private readonly logger = new Logger('OAuth');

  constructor(
    @InjectRepository(Social) private readonly socials: Repository<Social>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
    private readonly uploads: UploadService,
  ) {}

  /** Signs a provider profile into the token the popup hands to the frontend. */
  encodeClaim(profile: ProviderProfile): string {
    return this.jwt.sign(toClaim(profile));
  }

  /** Returns null for anything that is not a claim this server signed. */
  decodeClaim(token: unknown): OAuthClaim | null {
    if (typeof token !== 'string' || token === '') {
      return null;
    }

    try {
      const payload: unknown = this.jwt.verify(token);

      return isOAuthClaim(payload) ? payload : null;
    } catch {
      return null;
    }
  }

  findSocial(provider: string, accountId: string): Promise<Social | null> {
    return this.socials
      .createQueryBuilder('social')
      .leftJoinAndSelect('social.user', 'user')
      .where('social.provider = :provider AND social.account_id = :accountId', {
        provider,
        accountId,
      })
      .getOne();
  }

  socialsOfUser(userId: number): Promise<Social[]> {
    return this.socials
      .createQueryBuilder('social')
      .where('social.userId = :userId', { userId })
      .orderBy('social.id', 'ASC')
      .getMany();
  }

  createSocial(
    provider: OAuthProvider,
    accountId: string,
    name: string,
    photo: string,
    userId: number,
  ): Promise<Social> {
    return this.socials.save(
      this.socials.create({
        provider,
        accountId,
        accountName: name,
        accountPhoto: photo,
        userId,
      }),
    );
  }

  async updateSocial(
    social: Social,
    name: string,
    photo: string,
  ): Promise<Social> {
    social.accountName = name;
    social.accountPhoto = photo;

    return this.socials.save(social);
  }

  async deleteSocial(
    userId: number,
    provider: string,
    accountId: string,
  ): Promise<void> {
    await this.socials.delete({
      userId,
      provider: provider as OAuthProvider,
      accountId,
    });
  }

  findUserByEmail(email: string): Promise<User | null> {
    if (!email) {
      return Promise.resolve(null);
    }

    return this.users
      .createQueryBuilder('user')
      .where('user.email = :email AND user.deleted_at IS NULL', { email })
      .getOne();
  }

  findUserByUsername(username: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .where('user.username = :username AND user.deleted_at IS NULL', {
        username,
      })
      .getOne();
  }

  /** Creates an activated account owning the linked social. */
  async register(
    claim: OAuthClaim,
    username: string,
    password: string,
  ): Promise<User> {
    return this.users.save(
      this.users.create({
        username,
        password: await this.passwords.hash(password),
        email: claim.email,
        fullname: claim.name,
        role: ROLES.USER,
        isActivated: true,
      }),
    );
  }

  /**
   * Copies the provider avatar in as the user's photo. Best-effort: a failure
   * here must not fail the registration that triggered it.
   */
  async adoptProviderPhoto(user: User, url: string): Promise<void> {
    if (!url) {
      return;
    }

    try {
      const stored = await this.uploads.storeRemote(
        url,
        UPLOAD_TARGETS.PROFILES,
        FILE_TYPES.IMAGE,
        user,
      );

      if (stored) {
        await this.users.update(user.id, { photoId: stored.id });
      }
    } catch (error) {
      this.logger.warn(
        `could not adopt provider photo for user ${user.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** True when this provider takes part in the redirect handshake. */
  static isRedirectProvider(provider: string): boolean {
    return (
      provider === OAUTH_PROVIDERS.VKONTAKTE ||
      provider === OAUTH_PROVIDERS.GOOGLE
    );
  }
}
