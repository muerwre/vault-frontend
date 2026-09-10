import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import {
  getFrontendResetUrl,
  getPublicHost,
  getSmtpConfig,
} from '../../config/env';

/**
 * Optional by config: with no SMTP host configured, sends are logged and
 * skipped. Callers must treat a skipped send as success — a mail outage should
 * not fail the request that triggered it.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger('Mail');
  private transporter: Transporter | null = null;

  get isEnabled(): boolean {
    return Boolean(getSmtpConfig().host);
  }

  async sendRestoreCode(email: string, code: string): Promise<void> {
    const url = `https://${getPublicHost()}${getFrontendResetUrl()}${code}`;

    await this.send(
      email,
      'Восстановление пароля',
      `Для восстановления пароля перейдите по ссылке: ${url}`,
    );
  }

  private async send(to: string, subject: string, text: string): Promise<void> {
    if (!to) {
      return;
    }

    const config = getSmtpConfig();

    if (!config.host) {
      this.logger.warn(`SMTP is not configured — skipped mail to ${to}`);
      return;
    }

    this.transporter ??= nodemailer.createTransport({
      host: config.host,
      port: config.port,
      // Port 25 is plain SMTP; only 465 is implicit TLS.
      secure: config.port === 465,
      ...(config.user
        ? { auth: { user: config.user, pass: config.password } }
        : {}),
    });

    await this.transporter.sendMail({ from: config.from, to, subject, text });
  }
}
