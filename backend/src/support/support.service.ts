import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async submitContact(userId: string, userEmail: string, dto: {
    category: string;
    subject: string;
    message: string;
  }) {
    if (!dto.category || !dto.subject || !dto.message) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Category, subject, and message are required' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const year = new Date().getFullYear();
    const countThisYear = await this.prisma.grievanceCase.count({
      where: {
        caseId: { startsWith: `OASIS-GRV-${year}-` },
      },
    });

    const sequenceNum = String(countThisYear + 1).padStart(4, '0');
    const caseId = `OASIS-GRV-${year}-${sequenceNum}`;

    const grievance = await this.prisma.grievanceCase.create({
      data: {
        caseId,
        submitterId: userId || null,
        email: userEmail,
        category: dto.category,
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        status: 'open',
      },
    });

    const isMisconduct = dto.category === 'admin_misconduct';
    const targetStaffEmail = isMisconduct
      ? this.configService.get<string>('mail.oversightEmail') || 'oversight@oasis.community'
      : this.configService.get<string>('mail.grievanceEmail') || 'grievance@oasis.community';

    // 1. Notify oversight/grievance staff
    this.mailService.sendMail({
      to: targetStaffEmail,
      subject: `[${caseId}] New Support/Grievance Case: ${dto.subject}`,
      headline: `Case ${caseId} (${dto.category})`,
      body: `Submitter: ${userEmail}\nCategory: ${dto.category}\nSubject: ${dto.subject}\n\nMessage:\n${dto.message}`,
    });

    // 2. Send acknowledgment to submitter
    this.mailService.sendMail({
      to: userEmail,
      subject: `[${caseId}] Support Request Received: ${dto.subject}`,
      headline: 'We have received your message',
      body: `Your reference ID is ${caseId}. Our team will review your inquiry and respond within 48 business hours.\n\nSummary:\nCategory: ${dto.category}\nSubject: ${dto.subject}`,
    });

    return { caseId: grievance.caseId };
  }
}
