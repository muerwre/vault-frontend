import * as nodemailer from 'nodemailer';

import { MailService } from './mail.service';

jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

const createTransport = nodemailer.createTransport as jest.Mock;

describe('MailService', () => {
  const keys = ['SMTP_HOST', 'SMTP_FROM', 'PUBLIC_URL', 'FRONTEND_RESET_URL'];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

  let sendMail: jest.Mock;

  beforeEach(() => {
    process.env.SMTP_HOST = 'smtp.example';
    process.env.SMTP_FROM = 'vault@example.org';
    process.env.PUBLIC_URL = 'https://vault48.example';
    delete process.env.FRONTEND_RESET_URL;

    sendMail = jest.fn().mockResolvedValue({});
    createTransport.mockReturnValue({ sendMail });
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    jest.clearAllMocks();
  });

  it('sends the restore mail with its usual subject, text and html', async () => {
    await new MailService().sendRestoreCode('user@example.org', 'abc123');

    const [mail] = sendMail.mock.calls[0];
    const link = 'https://vault48.example/restore/abc123';

    expect(mail).toMatchObject({
      from: 'vault@example.org',
      to: 'user@example.org',
      subject: 'Кто-то пытается сбросить пароль!',
    });
    expect(mail.text).toBe(
      'Кто-то (или что-то) попросило нас сбросить ваш пароль. \n\n' +
        'Если это что-то вы, то просто перейдите по ссылке и выберите новый пароль. \n\n' +
        'Или не делайте ничего. Зачем? Почему?\n\n' +
        `А! Ссылка: ${link}`,
    );
    expect(mail.html).toContain(`<a href="${link}">сбросить пароль</a>`);
    expect(mail.html).toMatch(/^<h4>Кто-то \(или что-то\) попросило/);
  });

  it('logs a failed send instead of failing the caller', async () => {
    sendMail.mockRejectedValue(new Error('connection refused'));

    await expect(
      new MailService().sendRestoreCode('user@example.org', 'abc123'),
    ).resolves.toBeUndefined();
  });

  it('skips sending when SMTP is not configured', async () => {
    process.env.SMTP_HOST = '';

    await new MailService().sendRestoreCode('user@example.org', 'abc123');

    expect(sendMail).not.toHaveBeenCalled();
  });
});
