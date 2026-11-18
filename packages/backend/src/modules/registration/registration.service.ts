import { randomUUID } from 'crypto';

import {
  HttpStatus,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  ERROR_CODES,
  MAX_REGISTRATION_REASON_LENGTH,
  REGISTRATION_DELIVERIES,
  REGISTRATION_STATUSES,
  ROLES,
} from '@vault/common/constants';
import {
  type DataSource,
  In,
  IsNull,
  LessThanOrEqual,
  Not,
  type Repository,
} from 'typeorm';

import { getRegistrationConfig } from '../../config/env';
import { RegistrationRequest } from '../../entities/registration-request.entity';
import { User } from '../../entities/user.entity';
import {
  VaultException,
  VaultValidationException,
} from '../../globals/exceptions';
import { RateLimiter } from '../../globals/rate-limiter';
import { toWireDateOrNull, toWireString } from '../../wire/serialize';
import { AuthService } from '../auth/auth.service';
import { isEmail, normalizeEmail } from '../auth/email';
import { PasswordService } from '../auth/password.service';
import {
  MailService,
  registrationLink,
  type MailResult,
} from '../mail/mail.service';
import { validateSocialRegister } from '../oauth/oauth.validation';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** How long a mailed link works, counted from its first successful send. */
export const CODE_TTL_MS = 72 * HOUR_MS;

/** Failed sends before an invite is left for an admin to retry. */
export const MAX_SEND_ATTEMPTS = 3;

export const RETRY_DELAY_MS = DAY_MS;

/** How often due sends are looked for. */
const DELIVERY_POLL_MS = 15 * 60 * 1000;

/** Submissions per address, and per client, within an hour. */
const PER_EMAIL_PER_HOUR = 1;
const PER_IP_PER_HOUR = 10;

export interface Features {
  registration: boolean;
  registration_approval: boolean;
}

/** What the guest is told once the request is accepted. */
export type RegistrationOutcome = 'mailed' | 'awaiting_approval';

export interface WireRegistrationRequest {
  id: number;
  email: string;
  reason: string;
  status: string;
  delivery: string;
  send_attempts: number;
  last_error: string;
  next_attempt_at: string | null;
  last_sent_at: string | null;
  code_expires_at: string | null;
  /** The link was sent but can no longer be used. */
  is_expired: boolean;
  /** The mailed link, while it can still be used. */
  link: string | null;
  requested_at: string | null;
  created_at: string | null;
}

const toWire = (
  row: RegistrationRequest,
  now: Date,
): WireRegistrationRequest => ({
  id: row.id,
  email: row.email,
  reason: toWireString(row.reason),
  status: row.status,
  delivery: row.delivery,
  send_attempts: row.sendAttempts,
  last_error: toWireString(row.lastError),
  next_attempt_at: toWireDateOrNull(row.nextAttemptAt),
  last_sent_at: toWireDateOrNull(row.lastSentAt),
  code_expires_at: toWireDateOrNull(row.codeExpiresAt),
  is_expired: isExpired(row, now),
  link: row.code && isUsable(row, now) ? registrationLink(row.code) : null,
  requested_at: toWireDateOrNull(row.requestedAt),
  created_at: toWireDateOrNull(row.createdAt),
});

const isExpired = (row: RegistrationRequest, now: Date): boolean =>
  row.codeExpiresAt !== null && row.codeExpiresAt.getTime() <= now.getTime();

/** Approved, mailed at least once, and not expired. */
const isUsable = (row: RegistrationRequest, now: Date): boolean =>
  row.status === REGISTRATION_STATUSES.APPROVED &&
  row.codeExpiresAt !== null &&
  !isExpired(row, now);

/** A unique index violation, optionally of the named index. */
const isDuplicateEntry = (error: unknown, index?: string): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const { code, sqlMessage } = error as {
    code?: unknown;
    sqlMessage?: unknown;
  };

  return (
    code === 'ER_DUP_ENTRY' &&
    (!index || String(sqlMessage ?? '').includes(index))
  );
};

/** What a guest is told when the address already has an account. */
const EMAIL_TAKEN = 'Почта уже занята, вы забыли пароль?';

/**
 * Registration by email. A guest submits an address (and, with approval on, a
 * reason); once allowed, a link is mailed where they pick a username and
 * password. Failed sends are retried a day apart, then left for an admin.
 */
@Injectable()
export class RegistrationService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('Registration');
  private readonly perEmail = new RateLimiter(PER_EMAIL_PER_HOUR, HOUR_MS);
  private readonly perIp = new RateLimiter(PER_IP_PER_HOUR, HOUR_MS);

  private timer?: NodeJS.Timeout;
  private current?: Promise<number>;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(RegistrationRequest)
    private readonly requests: Repository<RegistrationRequest>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly auth: AuthService,
    private readonly passwords: PasswordService,
    private readonly mail: MailService,
  ) {}

  onApplicationBootstrap(): void {
    if (!this.mail.isEnabled) {
      return;
    }

    this.timer = setInterval(() => void this.deliverDue(), DELIVERY_POLL_MS);
    this.timer.unref();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    await this.current;
  }

  /** What is actually allowed: nothing works without mail. */
  getFeatures(): Features {
    const config = getRegistrationConfig();
    const registration = config.enabled && this.mail.isAvailable;

    return {
      registration,
      registration_approval: registration && config.approval,
    };
  }

  /** `POST /auth/register`. */
  async request(
    rawEmail: unknown,
    rawReason: unknown,
    ip: string,
  ): Promise<RegistrationOutcome> {
    const features = this.getFeatures();

    if (!features.registration) {
      throw new VaultException(
        ERROR_CODES.RegistrationClosed,
        HttpStatus.FORBIDDEN,
        'Регистрация сейчас закрыта',
      );
    }

    const approval = features.registration_approval;
    const outcome: RegistrationOutcome = approval
      ? 'awaiting_approval'
      : 'mailed';

    const email = normalizeEmail(String(rawEmail ?? ''));
    const reason = String(rawReason ?? '').trim();
    const errors: Record<string, string> = {};

    if (!isEmail(email)) {
      errors.email = 'Не похоже на email';
    }

    if (approval && !reason) {
      errors.reason = 'Расскажите немного о себе';
    } else if (reason.length > MAX_REGISTRATION_REASON_LENGTH) {
      errors.reason = 'Слишком длинно';
    }

    if (Object.keys(errors).length > 0) {
      throw new VaultValidationException(
        errors,
        HttpStatus.BAD_REQUEST,
        'Проверьте введённые данные',
      );
    }

    if (!this.perIp.take(ip)) {
      throw this.tooManyRequests();
    }

    // Checked before the per-address limit, so someone who mistyped their
    // own address can fix it right away.
    if (await this.auth.isEmailTaken(email)) {
      throw new VaultException(
        ERROR_CODES.UserExistWithEmail,
        HttpStatus.CONFLICT,
        EMAIL_TAKEN,
      );
    }

    if (!this.perEmail.take(email)) {
      throw this.tooManyRequests();
    }

    const now = new Date();
    const existing = await this.requests.findOneBy({ email });
    const row =
      existing ?? this.requests.create({ email, sendAttempts: 0, code: null });

    row.reason = reason || row.reason || null;
    row.requestedAt = now;

    switch (existing?.status) {
      case REGISTRATION_STATUSES.PENDING_APPROVAL:
        // Still waiting; only the reason is refreshed.
        await this.requests.save(row);
        return outcome;

      case REGISTRATION_STATUSES.APPROVED:
        // Already allowed: send the link again, as is, unless it expired.
        await this.queueSend(row);
        return outcome;

      default:
        // New, rejected before, or completed by an account since removed.
        break;
    }

    row.decidedBy = null;
    row.decidedAt = null;
    row.userId = null;
    row.code = null;
    row.codeExpiresAt = null;

    if (approval) {
      row.status = REGISTRATION_STATUSES.PENDING_APPROVAL;
      row.delivery = REGISTRATION_DELIVERIES.NONE;
      row.nextAttemptAt = null;
      await this.requests.save(row);
      await this.notifyAdmins(row);

      return outcome;
    }

    row.status = REGISTRATION_STATUSES.APPROVED;
    await this.queueSend(row);

    return outcome;
  }

  /** `GET /auth/register/:code`: the address the link was sent to. */
  async checkCode(code: string): Promise<{ email: string }> {
    const row = await this.findUsable(code);

    return { email: row.email };
  }

  /**
   * `PUT /auth/register/:code`: creates the account and consumes the link in
   * one transaction, so a double submit cannot create two users.
   */
  async complete(
    code: string,
    rawUsername: unknown,
    rawPassword: unknown,
  ): Promise<User> {
    const username = String(rawUsername ?? '').trim();
    const password = String(rawPassword ?? '');
    const invalid = validateSocialRegister({ username, password });

    if (invalid) {
      throw new VaultValidationException(invalid, HttpStatus.BAD_REQUEST);
    }

    const usable = await this.findUsable(code);

    // The address may have been taken since the invite went out.
    if (await this.auth.isEmailTaken(usable.email)) {
      throw this.emailTakenSinceInvite();
    }

    if (await this.auth.isUsernameTaken(username)) {
      throw new VaultValidationException(
        { username: 'Это имя уже занято' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hash = await this.passwords.hash(password);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const requests = manager.getRepository(RegistrationRequest);
        const row = await requests.findOne({
          where: { code },
          lock: { mode: 'pessimistic_write' },
        });

        if (!row || !isUsable(row, new Date())) {
          throw this.invalidCode();
        }

        const users = manager.getRepository(User);
        const user = await users.save(
          users.create({
            username,
            password: hash,
            email: row.email,
            fullname: null,
            role: ROLES.USER,
            isActivated: true,
          }),
        );

        row.status = REGISTRATION_STATUSES.COMPLETED;
        row.userId = user.id;
        row.code = null;
        row.delivery = REGISTRATION_DELIVERIES.NONE;
        row.nextAttemptAt = null;
        await requests.save(row);

        return user;
      });
    } catch (error) {
      // Lost a race for the name or the address.
      if (isDuplicateEntry(error, 'uq_user_email')) {
        throw this.emailTakenSinceInvite();
      }

      if (isDuplicateEntry(error)) {
        throw new VaultValidationException(
          { username: 'Это имя уже занято' },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw error;
    }
  }

  /** Requests waiting for an admin, and invites not used yet. */
  async list(): Promise<WireRegistrationRequest[]> {
    const rows = await this.requests.find({
      where: {
        status: In([
          REGISTRATION_STATUSES.PENDING_APPROVAL,
          REGISTRATION_STATUSES.APPROVED,
        ]),
      },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
    const now = new Date();

    return rows.map((row) => toWire(row, now));
  }

  /** Shown as the red dot on the admin menu. */
  countPending(): Promise<number> {
    return this.requests.countBy({
      status: REGISTRATION_STATUSES.PENDING_APPROVAL,
    });
  }

  async approve(id: number, adminId: number): Promise<WireRegistrationRequest> {
    const row = await this.requireRow(id, [
      REGISTRATION_STATUSES.PENDING_APPROVAL,
    ]);

    row.status = REGISTRATION_STATUSES.APPROVED;
    row.decidedBy = adminId;
    row.decidedAt = new Date();
    await this.queueSend(row);

    return toWire(row, new Date());
  }

  /** No mail is sent; the guest may apply again later. */
  async reject(id: number, adminId: number): Promise<WireRegistrationRequest> {
    const row = await this.requireRow(id, [
      REGISTRATION_STATUSES.PENDING_APPROVAL,
      REGISTRATION_STATUSES.APPROVED,
    ]);

    row.status = REGISTRATION_STATUSES.REJECTED;
    row.decidedBy = adminId;
    row.decidedAt = new Date();
    row.code = null;
    row.codeExpiresAt = null;
    row.delivery = REGISTRATION_DELIVERIES.NONE;
    row.nextAttemptAt = null;
    await this.requests.save(row);

    return toWire(row, new Date());
  }

  /**
   * Sends an invite again right away, with a fresh attempt count. Not bound
   * by the guests' hourly limit.
   */
  async resend(id: number): Promise<WireRegistrationRequest> {
    const row = await this.requireRow(id, [REGISTRATION_STATUSES.APPROVED]);

    await this.queueSend(row);

    return toWire(row, new Date());
  }

  /** Sends everything due. Exposed so a run can be driven directly in tests. */
  deliverDue(): Promise<number> {
    this.current ??= this.runDue().finally(() => {
      this.current = undefined;
    });

    return this.current;
  }

  private async runDue(): Promise<number> {
    const due = await this.requests.find({
      where: {
        status: REGISTRATION_STATUSES.APPROVED,
        delivery: REGISTRATION_DELIVERIES.QUEUED,
        nextAttemptAt: LessThanOrEqual(new Date()),
      },
      order: { nextAttemptAt: 'ASC' },
    });

    for (const row of due) {
      await this.attempt(row);
    }

    return due.length;
  }

  /** Resets the attempts and tries to send now. */
  private async queueSend(row: RegistrationRequest): Promise<void> {
    row.sendAttempts = 0;
    row.lastError = null;
    row.delivery = REGISTRATION_DELIVERIES.QUEUED;
    row.nextAttemptAt = new Date();
    await this.requests.save(row);
    await this.attempt(row);
  }

  /**
   * One send. While mail is down the attempt is postponed rather than spent.
   * The link keeps its code until it expires, so a resend mails the same one.
   */
  private async attempt(row: RegistrationRequest): Promise<void> {
    const now = new Date();

    if (!this.mail.isAvailable) {
      row.nextAttemptAt = new Date(now.getTime() + HOUR_MS);
      await this.requests.save(row);
      return;
    }

    // Taken since the request was made: an invite could never be used.
    if (await this.auth.isEmailTaken(row.email)) {
      row.delivery = REGISTRATION_DELIVERIES.FAILED;
      row.nextAttemptAt = null;
      row.lastError = 'Почта уже занята другим аккаунтом';
      row.code = null;
      row.codeExpiresAt = null;
      await this.requests.save(row);
      return;
    }

    if (!row.code || isExpired(row, now)) {
      row.code = randomUUID();
      row.codeExpiresAt = null;
    }

    const result: MailResult = await this.mail.sendRegistrationLink(
      row.email,
      row.code,
    );

    if (!('error' in result)) {
      row.delivery = REGISTRATION_DELIVERIES.SENT;
      row.sendAttempts = 0;
      row.nextAttemptAt = null;
      row.lastError = null;
      row.lastSentAt = now;
      row.codeExpiresAt ??= new Date(now.getTime() + CODE_TTL_MS);
    } else {
      row.sendAttempts += 1;
      row.lastError = result.error;

      if (row.sendAttempts >= MAX_SEND_ATTEMPTS) {
        row.delivery = REGISTRATION_DELIVERIES.FAILED;
        row.nextAttemptAt = null;
        this.logger.warn(
          `gave up mailing the registration link to ${row.email}: ${result.error}`,
        );
      } else {
        row.nextAttemptAt = new Date(now.getTime() + RETRY_DELAY_MS);
      }
    }

    await this.requests.save(row);
  }

  private async notifyAdmins(row: RegistrationRequest): Promise<void> {
    const admins = await this.users.find({
      select: { email: true },
      where: { role: ROLES.ADMIN, deletedAt: IsNull(), email: Not(IsNull()) },
    });

    await this.mail.sendApprovalRequest(
      admins.map((admin) => admin.email ?? '').filter(Boolean),
      row.email,
      row.reason ?? '',
    );
  }

  private async findUsable(code: string): Promise<RegistrationRequest> {
    const row = code ? await this.requests.findOneBy({ code }) : null;

    if (!row || !isUsable(row, new Date())) {
      throw this.invalidCode();
    }

    return row;
  }

  private tooManyRequests(): VaultException {
    return new VaultException(
      ERROR_CODES.TooManyRequests,
      HttpStatus.TOO_MANY_REQUESTS,
      'Слишком часто. Попробуйте через час',
    );
  }

  private emailTakenSinceInvite(): VaultException {
    return new VaultException(
      ERROR_CODES.UserExistWithEmail,
      HttpStatus.CONFLICT,
      'Эта почта уже занята другим аккаунтом',
    );
  }

  private invalidCode(): VaultException {
    return new VaultException(
      ERROR_CODES.CodeIsInvalid,
      HttpStatus.NOT_FOUND,
      'Ссылка недействительна или устарела',
    );
  }

  private async requireRow(
    id: number,
    statuses: string[],
  ): Promise<RegistrationRequest> {
    const row = Number.isFinite(id)
      ? await this.requests.findOneBy({ id })
      : null;

    if (!row || !statuses.includes(row.status)) {
      throw new VaultException(ERROR_CODES.EmptyRequest, HttpStatus.NOT_FOUND);
    }

    return row;
  }
}
