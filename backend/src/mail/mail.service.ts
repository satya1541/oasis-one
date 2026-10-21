import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

export interface SendMailOptions {
  to: string;
  subject: string;
  headline?: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly isConsole: boolean;
  private readonly from: string;
  private readonly logoUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const transport = this.configService.get<string>('mail.transport') || 'console';
    this.isConsole = transport === 'console';
    this.from = this.configService.get<string>('mail.from') || 'OASIS ONE <no-reply@oasisodisha.in>';
    this.logoUrl = this.configService.get<string>('mail.logoUrl') || 'https://oasisodisha.in/brand/oasis-logo-email.png';

    if (!this.isConsole) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('mail.host'),
        port: this.configService.get<number>('mail.port'),
        auth: {
          user: this.configService.get<string>('mail.user'),
          pass: this.configService.get<string>('mail.pass'),
        },
      });
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const html = this.buildBrandedHtml(options);
    const text = this.buildPlainText(options);

    // Record in email outbox
    const outbox = await this.prisma.emailOutbox.create({
      data: {
        to: options.to,
        subject: options.subject,
        htmlBody: html,
        textBody: text,
        status: 'pending',
      },
    });

    if (this.isConsole) {
      this.logger.log(`\n================== [EMAIL DISPATCHED (CONSOLE)] ==================
To: ${options.to}
From: ${this.from}
Subject: ${options.subject}
Action: ${options.actionText || 'N/A'} -> ${options.actionUrl || 'N/A'}
------------------------------------------------------------------
${text}
==================================================================\n`);

      await this.prisma.emailOutbox.update({
        where: { id: outbox.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
        },
      });
      return;
    }

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: this.from,
          to: options.to,
          subject: options.subject,
          text,
          html,
        });

        await this.prisma.emailOutbox.update({
          where: { id: outbox.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${options.to}: ${err.message}`, err.stack);
      await this.prisma.emailOutbox.update({
        where: { id: outbox.id },
        data: {
          status: 'failed',
          errorMessage: err.message,
          attempts: { increment: 1 },
        },
      });
    }
  }

  private buildBrandedHtml(options: SendMailOptions): string {
    const actionButton = options.actionUrl && options.actionText
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
          <tr>
            <td align="center" bgcolor="#E9C68C" style="border-radius: 6px;">
              <a href="${options.actionUrl}" target="_blank" style="font-size: 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 600; color: #1E1F33; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                ${options.actionText}
              </a>
            </td>
          </tr>
        </table>
      `
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F3EFE6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#F3EFE6">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%; background-color: #FBF7EE; border-radius: 8px; overflow: hidden; border: 1px solid #E5DFD0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td bgcolor="#1E1F33" style="padding: 24px 32px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="color: #E9C68C; font-size: 20px; font-weight: 700; letter-spacing: 0.05em; font-family: 'Jost', sans-serif;">OASIS ONE</span>
                  </td>
                  <td align="right">
                    <span style="color: #9DA3B4; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;">Community Portal</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Hairline Divider -->
          <tr>
            <td bgcolor="#E9C68C" style="height: 2px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <!-- Body -->
          <tr>
            <td bgcolor="#FBF7EE" style="padding: 36px 32px; color: #1E1F33; font-size: 15px; line-height: 1.6;">
              ${options.headline ? `<h1 style="color: #1E1F33; font-size: 22px; font-weight: 700; margin: 0 0 16px 0;">${options.headline}</h1>` : ''}
              <div style="color: #2D3047; font-size: 15px; line-height: 1.6;">
                ${options.body.replace(/\n/g, '<br/>')}
              </div>
              ${actionButton}
              <p style="margin: 24px 0 0 0; font-size: 13px; color: #686B82;">
                If you did not initiate this request or have questions, please reach out to our team at support@oasis.community.
              </p>
            </td>
          </tr>
          <!-- Footer Divider -->
          <tr>
            <td bgcolor="#E5DFD0" style="height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#F5F0E4" style="padding: 20px 32px; text-align: center; color: #686B82; font-size: 12px;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #1E1F33;">Odisha · Startup Community</p>
              <p style="margin: 0;">OASIS ONE Portal · Private Network for Founders & Mentors</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  private buildPlainText(options: SendMailOptions): string {
    let text = `${options.headline ? options.headline + '\n\n' : ''}${options.body}\n\n`;
    if (options.actionUrl && options.actionText) {
      text += `${options.actionText}: ${options.actionUrl}\n\n`;
    }
    text += `Odisha · Startup Community\nOASIS ONE Portal`;
    return text;
  }
}
