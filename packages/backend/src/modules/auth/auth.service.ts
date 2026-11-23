import { randomUUID } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BORIS_NODE_ID,
  FILE_TYPES,
  OAUTH_PROVIDERS,
  REGISTRATION_STATUSES,
  ROLES,
} from '@vault/common/constants';
import type { ITokenClaims, IUserProfileSettings } from '@vault/common/types';
import { IsNull, Repository } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { RegistrationRequest } from '../../entities/registration-request.entity';
import { RestoreCode, Social } from '../../entities/social.entity';
import { UserProfile } from '../../entities/user-profile.entity';
import { User } from '../../entities/user.entity';
import { NodeView } from '../../entities/views.entity';
import {
  toWireDate,
  toWireSelf,
  toWireShallowFile,
  type WireSelf,
  type WireShallowFile,
} from '../../wire/serialize';
import { MailService } from '../mail/mail.service';

import { PasswordService } from './password.service';

/** How long a mailed password reset link works. */
export const RESTORE_CODE_TTL_MS = 72 * 60 * 60 * 1000;

export interface WireUpdates {
  boris: { commented_at: string };
  registrations?: { pending: number };
}

export interface WireRestoreUser {
  username: string;
  photo: WireShallowFile | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(NodeView)
    private readonly nodeViews: Repository<NodeView>,
    @InjectRepository(RestoreCode)
    private readonly restoreCodes: Repository<RestoreCode>,
    @InjectRepository(Social) private readonly socials: Repository<Social>,
    @InjectRepository(RegistrationRequest)
    private readonly registrations: Repository<RegistrationRequest>,
    private readonly passwords: PasswordService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  /**
   * Mints a token with the frozen claim set. Never pass `noTimestamp` when
   * signing: it strips the `iat` from the payload rather than just suppressing an
   * added one, and there must be no `exp` at all.
   */
  signToken(user: User): string {
    const claims: ITokenClaims = {
      uid: user.id,
      nme: user.username,
      rol: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwt.sign(claims);
  }

  /**
   * Verifies credentials against either hash format. A legacy MD5 hash that
   * verifies is transparently re-hashed with bcrypt, so it converts on first
   * login. Returns null for any failure — callers must not distinguish "no such
   * user" from "wrong password".
   */
  async authenticate(username: string, password: string): Promise<User | null> {
    if (!username || !password) {
      return null;
    }

    const user = await this.findByUsername(username);

    if (!user || !(await this.passwords.verify(password, user.password))) {
      return null;
    }

    if (this.passwords.needsUpgrade(user.password)) {
      await this.passwords.upgrade(user.id, password);
    }

    return user;
  }

  findByUsername(username: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoinAndSelect('user.cover', 'cover')
      .where('user.username = :username', { username })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  /**
   * Counts deleted accounts too: the unique index covers them, so a name only
   * a deleted account holds still cannot be reused.
   */
  async isUsernameTaken(username: string): Promise<boolean> {
    return (await this.users.countBy({ username })) > 0;
  }

  /**
   * Like {@link isUsernameTaken}. A linked Google account counts too: its id
   * is the email, and its owner may have a different one on their profile.
   * `exceptUserId` skips the caller's own account.
   */
  async isEmailTaken(email: string, exceptUserId?: number): Promise<boolean> {
    const users = this.users
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    const google = this.socials
      .createQueryBuilder('social')
      .where('social.provider = :provider AND social.account_id = :email', {
        provider: OAUTH_PROVIDERS.GOOGLE,
        email,
      })
      .andWhere('social.userId IS NOT NULL');

    if (exceptUserId !== undefined) {
      users.andWhere('user.id <> :exceptUserId', { exceptUserId });
      google.andWhere('social.userId <> :exceptUserId', { exceptUserId });
    }

    const [byProfile, byGoogle] = await Promise.all([
      users.getCount(),
      google.getCount(),
    ]);

    return byProfile + byGoogle > 0;
  }

  /** A live account by email, or null. */
  findByEmail(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  findByUsernameOrEmail(value: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('user')
      .where('(user.username = :value OR user.email = :value)', { value })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  /** Reloads the user so the response reflects writes made during the request. */
  async getSelf(userId: number): Promise<WireSelf | null> {
    const user = await this.users.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });

    if (!user) {
      return null;
    }

    const [lastSeenBoris, profile] = await Promise.all([
      this.getOrCreateBorisView(userId),
      this.profiles.findOneBy({ userId }),
    ]);

    return toWireSelf(user, lastSeenBoris, profile);
  }

  /**
   * Writes the given profile page fields, creating the row on first save.
   * `settings` keys are merged over the stored ones, so saving one keeps the
   * rest.
   */
  async saveProfile(
    userId: number,
    fields: Partial<Pick<UserProfile, 'about' | 'aboutDisplay'>> & {
      settings?: Partial<IUserProfileSettings>;
    },
  ): Promise<void> {
    const { settings, ...columns } = fields;
    const hasSettings = !!settings && Object.keys(settings).length > 0;

    if (Object.keys(columns).length === 0 && !hasSettings) {
      return;
    }

    const profile =
      (await this.profiles.findOneBy({ userId })) ??
      this.profiles.create({ userId });

    Object.assign(profile, columns);

    if (hasSettings) {
      profile.settings = { ...(profile.settings ?? {}), ...settings };
    }

    await this.profiles.save(profile);
  }

  /** Bumps `user.last_seen`. Failures are not worth failing the request over. */
  async touchLastSeen(userId: number): Promise<void> {
    try {
      await this.users.update(userId, { lastSeen: () => 'NOW()' });
    } catch (error) {
      this.logger.warn(
        `could not update last_seen for ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * `last_seen_boris` is this user's `node_view` for the Boris node. The row is
   * created on first read, so a new user gets "now" rather than a null.
   */
  private async getOrCreateBorisView(userId: number): Promise<Date | null> {
    const existing = await this.nodeViews
      .createQueryBuilder('nv')
      .where('nv.userId = :userId AND nv.nodeId = :nodeId', {
        userId,
        nodeId: BORIS_NODE_ID,
      })
      .getOne();

    if (existing) {
      return existing.visited;
    }

    // Stamped by the database's clock, like the comments it is compared with.
    try {
      await this.nodeViews
        .createQueryBuilder()
        .insert()
        .values({ userId, nodeId: BORIS_NODE_ID, visited: () => 'NOW()' })
        .orUpdate(['visited'], ['nodeId', 'userId'])
        .execute();
    } catch (error) {
      this.logger.warn(
        `could not record boris view for ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const created = await this.nodeViews
      .createQueryBuilder('nv')
      .where('nv.userId = :userId AND nv.nodeId = :nodeId', {
        userId,
        nodeId: BORIS_NODE_ID,
      })
      .getOne();

    return created?.visited ?? new Date();
  }

  /** `GET /auth/updates`. Admins also get the registrations awaiting them. */
  async getUpdates(user: User): Promise<WireUpdates> {
    const boris = await this.nodes
      .createQueryBuilder('node')
      .where('node.id = :id', { id: BORIS_NODE_ID })
      .getOne();

    const updates: WireUpdates = {
      boris: { commented_at: toWireDate(boris?.commentedAt) },
    };

    if (user.role === ROLES.ADMIN) {
      updates.registrations = {
        pending: await this.registrations.countBy({
          status: REGISTRATION_STATUSES.PENDING_APPROVAL,
        }),
      };
    }

    return updates;
  }

  save(user: User): Promise<User> {
    return this.users.save(user);
  }

  async setPassword(userId: number, password: string): Promise<void> {
    await this.users.update(userId, {
      password: await this.passwords.hash(password),
    });
  }

  /** Only an existing, non-deleted image may be used as a photo or cover. */
  async findImage(fileId: number): Promise<File | null> {
    // deleted_at is a plain column here, so deleted files are excluded by hand.
    const file = await this.files.findOne({
      where: { id: fileId, deletedAt: IsNull() },
    });

    return file && file.type === FILE_TYPES.IMAGE ? file : null;
  }

  async setPhoto(userId: number, fileId: number | null): Promise<void> {
    await this.users.update(userId, { photoId: fileId });
  }

  async setCover(userId: number, fileId: number | null): Promise<void> {
    await this.users.update(userId, { coverId: fileId });
  }

  /**
   * Issues a fresh code, dropping any earlier one, so only the latest mailed
   * link works. Returns the code so the caller can mail it; it is never
   * exposed on the wire.
   */
  async createRestoreCode(userId: number): Promise<string> {
    await this.dropRestoreCodes(userId);

    const code = randomUUID();
    await this.restoreCodes.save(this.restoreCodes.create({ userId, code }));

    return code;
  }

  /** Invalidates every reset link the user was sent. */
  async dropRestoreCodes(userId: number): Promise<void> {
    await this.restoreCodes.delete({ userId });
  }

  async sendRestoreCode(
    email: string,
    username: string,
    code: string,
  ): Promise<void> {
    await this.mail.sendRestoreCode(email, username, code);
  }

  /** A code is usable for {@link RESTORE_CODE_TTL_MS}, and once. */
  async findRestoreCode(
    code: string,
  ): Promise<{ id: number; user: User } | null> {
    if (!code) {
      return null;
    }

    const row = await this.restoreCodes
      .createQueryBuilder('code')
      .leftJoinAndSelect('code.user', 'user')
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoinAndSelect('user.cover', 'cover')
      .where('code.code = :code', { code })
      .andWhere('code.created_at > :since', {
        since: new Date(Date.now() - RESTORE_CODE_TTL_MS),
      })
      .andWhere('user.deleted_at IS NULL')
      .getOne();

    return row?.user ? { id: row.id, user: row.user } : null;
  }

  toRestoreUser(user: User): WireRestoreUser {
    return {
      username: user.username,
      photo: toWireShallowFile(user.photo),
    };
  }
}
