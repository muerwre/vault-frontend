import { randomUUID } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BORIS_NODE_ID, FILE_TYPES } from '@vault/common/constants';
import type { ITokenClaims } from '@vault/common/types';
import { Repository } from 'typeorm';

import { File } from '../../entities/file.entity';
import { Node } from '../../entities/node.entity';
import { RestoreCode } from '../../entities/social.entity';
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

export interface WireRestoreUser {
  username: string;
  photo: WireShallowFile | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(File) private readonly files: Repository<File>,
    @InjectRepository(Node) private readonly nodes: Repository<Node>,
    @InjectRepository(NodeView) private readonly nodeViews: Repository<NodeView>,
    @InjectRepository(RestoreCode)
    private readonly restoreCodes: Repository<RestoreCode>,
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
    const user = await this.users.findOne({ where: { id: userId } });

    if (!user) {
      return null;
    }

    const lastSeenBoris = await this.getOrCreateBorisView(userId);

    return toWireSelf(user, lastSeenBoris);
  }

  /** Bumps `user.last_seen`. Failures are not worth failing the request over. */
  async touchLastSeen(userId: number): Promise<void> {
    try {
      await this.users.update(userId, { lastSeen: new Date() });
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

    const visited = new Date();

    try {
      await this.nodeViews
        .createQueryBuilder()
        .insert()
        .values({ userId, nodeId: BORIS_NODE_ID, visited })
        .orUpdate(['visited'], ['nodeId', 'userId'])
        .execute();
    } catch (error) {
      this.logger.warn(
        `could not record boris view for ${userId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return visited;
  }

  /** `GET /auth/updates`. */
  async getUpdates(): Promise<{ boris: { commented_at: string } }> {
    const boris = await this.nodes
      .createQueryBuilder('node')
      .where('node.id = :id', { id: BORIS_NODE_ID })
      .getOne();

    return { boris: { commented_at: toWireDate(boris?.commentedAt) } };
  }

  save(user: User): Promise<User> {
    return this.users.save(user);
  }

  async setPassword(userId: number, password: string): Promise<void> {
    await this.users.update(userId, { password: await this.passwords.hash(password) });
  }

  /** Only an existing image file may be used as a photo or cover. */
  async findImage(fileId: number): Promise<File | null> {
    const file = await this.files.findOne({ where: { id: fileId } });

    return file && file.type === FILE_TYPES.IMAGE ? file : null;
  }

  async setPhoto(userId: number, fileId: number | null): Promise<void> {
    await this.users.update(userId, { photoId: fileId });
  }

  async setCover(userId: number, fileId: number | null): Promise<void> {
    await this.users.update(userId, { coverId: fileId });
  }

  /**
   * One code per user, reused until consumed. Returns the code so the caller can
   * mail it; it is never exposed on the wire.
   */
  async findOrCreateRestoreCode(userId: number): Promise<string> {
    const existing = await this.restoreCodes
      .createQueryBuilder('code')
      .where('code.userId = :userId', { userId })
      .getOne();

    if (existing) {
      return existing.code;
    }

    const code = randomUUID();
    await this.restoreCodes.save(this.restoreCodes.create({ userId, code }));

    return code;
  }

  async sendRestoreCode(email: string, code: string): Promise<void> {
    await this.mail.sendRestoreCode(email, code);
  }

  /** Codes do not expire; they are removed once used. */
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
      .getOne();

    return row?.user ? { id: row.id, user: row.user } : null;
  }

  async consumeRestoreCode(id: number): Promise<void> {
    await this.restoreCodes.delete(id);
  }

  toRestoreUser(user: User): WireRestoreUser {
    return {
      username: user.username,
      photo: toWireShallowFile(user.photo),
    };
  }
}
