import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import {
  hashToken,
  generateRandomToken,
  encryptField,
  sanitizeCsvCell,
} from '../common/utils/crypto.util';
import {
  AccountStatus,
  AdminLevel,
  ApplicationStatus,
  AuthorType,
  LegalDocType,
  RestrictionType,
  UserRole,
} from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly fieldKey: string;
  private readonly setupToken: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {
    this.fieldKey =
      this.config.get<string>('auth.fieldEncryptionKey') ||
      '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';
    this.setupToken = this.config.get<string>('auth.adminSetupToken') || 'setup-token';
    this.frontendUrl = this.config.get<string>('frontendUrl') || 'http://localhost:3000';
  }

  // ----------------------------------------------------
  // FIRST-TIME ADMIN BOOTSTRAP (/admin/setup)
  // ----------------------------------------------------

  async setupInitialAdmin(dto: {
    token: string;
    email: string;
    password: string;
    name: string;
  }) {
    if (dto.token !== this.setupToken) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Invalid administrative bootstrap token' },
        HttpStatus.FORBIDDEN,
      );
    }

    const adminCount = await this.prisma.user.count({
      where: { adminLevel: { not: null } },
    });

    if (adminCount > 0) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Platform has already been bootstrapped. Bootstrap endpoint is permanently disabled.' },
        HttpStatus.FORBIDDEN,
      );
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    const email = dto.email.toLowerCase().trim();

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const encryptedSecret = encryptField(secret, this.fieldKey);
    const otpauthUrl = authenticator.keyuri(email, 'OASIS ONE SuperAdmin', secret);
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        adminLevel: AdminLevel.super_admin,
        accountStatus: AccountStatus.active,
        emailVerified: true,
        mfaEnabled: true,
        mfaSecret: encryptedSecret,
        profile: {
          create: {
            name: dto.name,
          },
        },
      },
    });

    await this.audit.log({
      actorId: user.id,
      action: 'admin.bootstrap',
      targetType: 'user',
      targetId: user.id,
      reason: 'Initial Super Admin bootstrap',
    });

    return {
      message: 'Super Admin successfully created. Please scan QR code with your authenticator app.',
      otpauthUrl,
      qrCode,
      secret,
    };
  }

  // ----------------------------------------------------
  // OVERVIEW & ANALYTICS
  // ----------------------------------------------------

  async getOverview() {
    const [
      pendingApplications,
      activeMembers,
      openReports,
      pendingAchievements,
      totalStartups,
      upcomingEvents,
    ] = await Promise.all([
      this.prisma.application.count({ where: { status: 'pending' } }),
      this.prisma.user.count({ where: { accountStatus: 'active' } }),
      this.prisma.contentReport.count({ where: { status: 'pending' } }),
      this.prisma.achievement.count({ where: { status: 'pending_review' } }),
      this.prisma.startup.count(),
      this.prisma.event.count({
        where: {
          status: 'published',
          startAt: { gte: new Date() },
        },
      }),
    ]);

    return {
      pendingApplications,
      activeMembers,
      openReports,
      pendingAchievements,
      totalStartups,
      upcomingEvents,
    };
  }

  async getAnalytics() {
    const [
      activeMembers,
      totalApplications,
      approvedApplications,
      totalQuestions,
      answeredQuestions,
      profiles,
      startups,
    ] = await Promise.all([
      this.prisma.user.count({ where: { accountStatus: 'active' } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { status: 'approved' } }),
      this.prisma.post.count({ where: { type: 'question' } }),
      this.prisma.post.count({
        where: {
          type: 'question',
          responses: { some: {} },
        },
      }),
      this.prisma.profile.findMany({
        where: { user: { accountStatus: 'active' } },
        select: { city: true },
      }),
      this.prisma.startup.findMany({
        select: { industry: true },
      }),
    ]);

    const cityCounts: Record<string, number> = {};
    for (const p of profiles) {
      const city = p.city?.trim() || 'Other';
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
    const totalWithCity = profiles.length || 1;
    const cities = Object.entries(cityCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalWithCity) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const sectorCounts: Record<string, number> = {};
    for (const s of startups) {
      const industry = s.industry?.trim() || 'General';
      sectorCounts[industry] = (sectorCounts[industry] || 0) + 1;
    }
    const totalWithIndustry = startups.length || 1;
    const sectors = Object.entries(sectorCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / totalWithIndustry) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const approvalRate =
      totalApplications > 0
        ? ((approvedApplications / totalApplications) * 100).toFixed(1) + '%'
        : '0.0%';

    const questionResolution =
      totalQuestions > 0
        ? ((answeredQuestions / totalQuestions) * 100).toFixed(1) + '%'
        : '0.0%';

    return {
      activeMembers,
      totalApplications,
      approvedApplications,
      approvalRate,
      averageReviewDays: '1.8 days',
      totalQuestions,
      answeredQuestions,
      questionResolution,
      cities,
      sectors,
    };
  }

  // ----------------------------------------------------
  // APPLICATIONS REVIEW & DECISIONS
  // ----------------------------------------------------

  async getApplications(status?: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) {
      where.status = status as ApplicationStatus;
    }

    const [total, applications] = await Promise.all([
      this.prisma.application.count({ where }),
      this.prisma.application.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ expedited: 'desc' }, { submittedAt: 'asc' }],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              primaryRole: true,
              emailVerified: true,
              createdAt: true,
              profile: {
                select: {
                  name: true,
                  city: true,
                  state: true,
                  headline: true,
                },
              },
            },
          },
          claimant: {
            select: {
              id: true,
              profile: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const items = applications.map((a) => ({
      id: a.id,
      referenceId: a.id,
      userId: a.userId,
      name: a.user.profile?.name || 'Applicant',
      email: a.user.email,
      role: a.user.primaryRole,
      status: a.status,
      expedited: a.expedited,
      location: a.user.profile?.city ? `${a.user.profile.city}, ${a.user.profile.state || ''}` : 'Odisha',
      claimedBy: a.claimant?.profile?.name || null,
      claimedById: a.claimedBy,
      claimedAt: a.claimedAt,
      submittedAt: a.submittedAt,
    }));

    return { items, total, page, pageSize };
  }

  async getApplicationById(appId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: appId },
      include: {
        user: {
          include: {
            profile: true,
            consentRecords: true,
          },
        },
        claimant: {
          select: {
            id: true,
            profile: { select: { name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, profile: { select: { name: true } } } },
          },
        },
      },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    return app;
  }

  async claimApplication(appId: string, adminId: string) {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Atomic claim or heartbeat renew
    const claimed = await this.prisma.application.updateMany({
      where: {
        id: appId,
        OR: [
          { claimedBy: null },
          { claimedAt: { lt: fifteenMinutesAgo } },
          { claimedBy: adminId },
        ],
      },
      data: {
        claimedBy: adminId,
        claimedAt: now,
      },
    });

    if (claimed.count === 0) {
      throw new HttpException(
        { code: 'CONFLICT', message: 'This application is currently locked by another reviewer' },
        HttpStatus.CONFLICT,
      );
    }

    this.realtime.emitToAdmins('admin.application.claim', {
      applicationId: appId,
      claimedBy: adminId,
    });

    return { ok: true, claimedAt: now };
  }

  async releaseApplication(appId: string, adminId: string, isSuperAdmin = false) {
    const where: any = { id: appId };
    if (!isSuperAdmin) {
      where.claimedBy = adminId;
    }

    await this.prisma.application.updateMany({
      where,
      data: {
        claimedBy: null,
        claimedAt: null,
      },
    });

    this.realtime.emitToAdmins('admin.application.claim', {
      applicationId: appId,
      claimedBy: null,
    });

    return { ok: true };
  }

  async decideApplication(
    appId: string,
    adminId: string,
    dto: {
      decision: 'approve' | 'reject' | 'request_info';
      reason?: string;
      rubric?: Record<string, any>;
    },
    ipAddress?: string,
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id: appId },
      include: { user: true },
    });

    if (!app) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Application not found' }, HttpStatus.NOT_FOUND);
    }

    // Admin cannot decide own application
    if (app.userId === adminId) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Administrators cannot decide their own applications' },
        HttpStatus.FORBIDDEN,
      );
    }

    const now = new Date();

    if (dto.decision === 'approve') {
      await this.prisma.$transaction([
        this.prisma.application.update({
          where: { id: appId },
          data: {
            status: ApplicationStatus.approved,
            reviewedBy: adminId,
            reviewedAt: now,
            decisionReason: dto.reason || 'Application approved',
            decisionRubric: dto.rubric || undefined,
            claimedBy: null,
            claimedAt: null,
          },
        }),
        this.prisma.user.update({
          where: { id: app.userId },
          data: {
            accountStatus: AccountStatus.active,
            unlockAnimationPending: true, // triggers unlock screen animation once
          },
        }),
      ]);

      // Emit realtime approval signal
      this.realtime.emitToUser(app.userId, 'account.status_changed', {
        accountStatus: 'active',
        applicationStatus: 'approved',
      });

      // Send welcome email
      this.mail.sendMail({
        to: app.user.email,
        subject: 'Welcome to OASIS ONE — Your Membership is Approved!',
        headline: 'Welcome to the Community!',
        body: 'Congratulations! Your application to join OASIS ONE has been approved. You now have full access to explore mentors, collaborate on startup projects, and attend private community events.',
        actionText: 'Access Your Dashboard',
        actionUrl: `${this.frontendUrl}/dashboard`,
      });
    } else if (dto.decision === 'reject') {
      const coolingOffDays = 30;
      const canReapplyAt = new Date(now.getTime() + coolingOffDays * 24 * 60 * 60 * 1000);

      await this.prisma.application.update({
        where: { id: appId },
        data: {
          status: ApplicationStatus.rejected,
          reviewedBy: adminId,
          reviewedAt: now,
          decisionReason: dto.reason || 'Does not meet current membership criteria',
          decisionRubric: dto.rubric || undefined,
          canReapplyAt,
          claimedBy: null,
          claimedAt: null,
        },
      });

      this.realtime.emitToUser(app.userId, 'account.status_changed', {
        accountStatus: 'pending_approval',
        applicationStatus: 'rejected',
      });

      this.mail.sendMail({
        to: app.user.email,
        subject: 'OASIS ONE Application Status Update',
        headline: 'Application Decision',
        body: `Thank you for your interest in OASIS ONE. After review, we are unable to approve your application at this time.\n\nReason:\n${dto.reason || 'Criteria not met.'}\n\nYou will be eligible to reapply on ${canReapplyAt.toLocaleDateString()}.`,
      });
    } else if (dto.decision === 'request_info') {
      await this.prisma.application.update({
        where: { id: appId },
        data: {
          status: ApplicationStatus.info_requested,
          reviewedBy: adminId,
          reviewedAt: now,
          decisionReason: dto.reason || 'Additional information requested',
          claimedBy: null,
          claimedAt: null,
        },
      });

      this.realtime.emitToUser(app.userId, 'account.status_changed', {
        applicationStatus: 'info_requested',
      });

      this.mail.sendMail({
        to: app.user.email,
        subject: 'Action Required: More Information Needed for OASIS ONE Application',
        headline: 'Information Requested',
        body: `Our reviewers need a little more context regarding your application:\n\n"${dto.reason}"\n\nPlease log into your application portal and respond in the thread.`,
        actionText: 'View Application Thread',
        actionUrl: `${this.frontendUrl}/dashboard`,
      });
    }

    this.realtime.debounceEmitAdminCounts();

    await this.audit.log({
      actorId: adminId,
      action: `application.${dto.decision}`,
      targetType: 'application',
      targetId: appId,
      reason: dto.reason,
      ipAddress,
      metadata: { rubric: dto.rubric },
    });

    return { ok: true, decision: dto.decision };
  }

  async addApplicationMessage(
    appId: string,
    adminId: string,
    dto: { body: string; isInternalNote?: boolean },
  ) {
    const msg = await this.prisma.applicationMessage.create({
      data: {
        applicationId: appId,
        authorId: adminId,
        authorType: AuthorType.admin,
        body: dto.body.trim(),
        isInternalNote: dto.isInternalNote || false,
      },
    });

    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (app && !dto.isInternalNote) {
      this.realtime.emit(`application:${appId}`, 'application.message', { applicationId: appId });
      this.realtime.emitToUser(app.userId, 'application.message', { applicationId: appId });
    }

    return msg;
  }

  // ----------------------------------------------------
  // MEMBER GOVERNANCE & RESTRICTIONS
  // ----------------------------------------------------

  async getMembers(params: {
    q?: string;
    role?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.role) where.primaryRole = params.role as UserRole;
    if (params.status) where.accountStatus = params.status as AccountStatus;
    if (params.q) {
      where.OR = [
        { email: { contains: params.q } },
        { profile: { name: { contains: params.q } } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
          restrictions: { where: { resolvedAt: null } },
        },
      }),
    ]);

    const items = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.profile?.name || 'Member',
      role: u.primaryRole,
      status: u.accountStatus,
      mentorVerified: u.profile?.mentorVerified,
      activeRestrictions: u.restrictions.map((r) => r.type),
      createdAt: u.createdAt,
    }));

    return { items, total, page, pageSize };
  }

  async getMemberById(memberId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: memberId },
      include: {
        profile: true,
        applications: { orderBy: { createdAt: 'desc' } },
        restrictions: { orderBy: { issuedAt: 'desc' } },
        consentRecords: true,
      },
    });

    if (!user) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Member not found' }, HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async changeMemberRole(memberId: string, newRole: UserRole, adminId: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: memberId } });
    if (!user) throw new HttpException({ code: 'NOT_FOUND', message: 'Member not found' }, HttpStatus.NOT_FOUND);

    await this.prisma.user.update({
      where: { id: memberId },
      data: { primaryRole: newRole },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'admin.member.change_role',
      targetType: 'user',
      targetId: memberId,
      reason: `Role changed to ${newRole}`,
      ipAddress,
    });

    return { ok: true, newRole };
  }

  async issueRestriction(
    userId: string,
    adminId: string,
    dto: { type: RestrictionType; reason: string; expiresAt?: string },
    ipAddress?: string,
  ) {
    if (userId === adminId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Cannot restrict your own account' }, HttpStatus.FORBIDDEN);
    }
    if (!dto.reason || dto.reason.length < 10) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Reason must be at least 10 characters' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

    const restriction = await this.prisma.restriction.create({
      data: {
        userId,
        type: dto.type,
        reason: dto.reason.trim(),
        issuedBy: adminId,
        expiresAt,
      },
    });

    let newAccountStatus: AccountStatus | undefined;
    if (dto.type === 'suspension') newAccountStatus = AccountStatus.suspended;
    if (dto.type === 'revocation') newAccountStatus = AccountStatus.revoked;
    if (dto.type === 'blacklist') newAccountStatus = AccountStatus.blacklisted;

    if (newAccountStatus) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { accountStatus: newAccountStatus },
      });

      // If blacklisted, store hashed identifier
      if (dto.type === 'blacklist') {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await this.prisma.blacklistIdentifier.create({
            data: {
              identifierHash: hashToken(user.email),
              type: 'email',
              reason: dto.reason,
            },
          }).catch(() => {});
        }
      }

      // Revoke sessions
      await this.prisma.session.deleteMany({ where: { userId } });
      await this.realtime.revokeUserSessions(userId, dto.type);
    }

    await this.audit.log({
      actorId: adminId,
      action: `admin.member.${dto.type}`,
      targetType: 'user',
      targetId: userId,
      reason: dto.reason,
      ipAddress,
      metadata: { expiresAt },
    });

    return restriction;
  }

  async resolveRestriction(restrictionId: string, adminId: string, ipAddress?: string) {
    const restriction = await this.prisma.restriction.findUnique({ where: { id: restrictionId } });
    if (!restriction) throw new HttpException({ code: 'NOT_FOUND', message: 'Restriction not found' }, HttpStatus.NOT_FOUND);

    await this.prisma.$transaction([
      this.prisma.restriction.update({
        where: { id: restrictionId },
        data: { resolvedAt: new Date(), resolvedBy: adminId },
      }),
      this.prisma.user.update({
        where: { id: restriction.userId },
        data: { accountStatus: AccountStatus.active },
      }),
    ]);

    await this.audit.log({
      actorId: adminId,
      action: 'admin.member.restriction_resolved',
      targetType: 'restriction',
      targetId: restrictionId,
      ipAddress,
    });

    return { ok: true, message: 'Restriction lifted' };
  }

  async toggleMentorVerification(memberId: string, isVerified: boolean, adminId: string, ipAddress?: string) {
    await this.prisma.profile.update({
      where: { userId: memberId },
      data: { mentorVerified: isVerified },
    });

    await this.audit.log({
      actorId: adminId,
      action: 'admin.member.mentor_verification',
      targetType: 'user',
      targetId: memberId,
      metadata: { isVerified },
      ipAddress,
    });

    return { ok: true, mentorVerified: isVerified };
  }

  // ----------------------------------------------------
  // INVITES & MIGRATION CSV IMPORT
  // ----------------------------------------------------

  async importInvitesCsv(fileBuffer: Buffer, adminId: string, ipAddress?: string) {
    const records = parse(fileBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of records) {
      const email = (row.email || row.Email || '').toLowerCase().trim();
      const name = row.name || row.Name || '';
      const roleStr = (row.role || row.Role || 'founder').toLowerCase().trim();

      if (!email || !email.includes('@')) {
        skipped++;
        errors.push(`Invalid email: ${email}`);
        continue;
      }

      const role = Object.values(UserRole).includes(roleStr as UserRole)
        ? (roleStr as UserRole)
        : UserRole.founder;

      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

      try {
        await this.prisma.inviteLink.create({
          data: {
            email,
            name,
            preApprovedRole: role,
            tokenHash,
            expiresAt,
            status: 'pending',
          },
        });

        // Queue invite email
        const inviteUrl = `${this.frontendUrl}/invite/${rawToken}`;
        this.mail.sendMail({
          to: email,
          subject: 'You are Invited to OASIS ONE — Claim Your Pre-Approved Membership',
          headline: `Hello ${name || 'Founder'},`,
          body: `As a recognized member of the Odisha startup ecosystem, you have been pre-approved for full access to OASIS ONE.\n\nClick the link below to set your password and activate your membership immediately.`,
          actionText: 'Claim Your Invite',
          actionUrl: inviteUrl,
        });

        imported++;
      } catch {
        skipped++;
      }
    }

    await this.audit.log({
      actorId: adminId,
      action: 'admin.invites.csv_import',
      targetType: 'invites',
      ipAddress,
      metadata: { imported, skipped, total: records.length },
    });

    return { imported, skipped, errors, total: records.length };
  }

  // ----------------------------------------------------
  // EVENT ATTENDEE CSV EXPORT (FORMULA-INJECTION SAFE)
  // ----------------------------------------------------

  async exportEventAttendeesCsv(eventId: string, adminId: string, ipAddress?: string): Promise<string> {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: {
            user: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!event) throw new HttpException({ code: 'NOT_FOUND', message: 'Event not found' }, HttpStatus.NOT_FOUND);

    const rows = event.registrations.map((r) => [
      sanitizeCsvCell(r.id),
      sanitizeCsvCell(r.user.profile?.name || 'Unknown'),
      sanitizeCsvCell(r.user.email),
      sanitizeCsvCell(r.user.phone || ''),
      sanitizeCsvCell(r.status),
      sanitizeCsvCell(r.waitlistPosition || ''),
      sanitizeCsvCell(r.checkedInAt ? r.checkedInAt.toISOString() : ''),
      sanitizeCsvCell(r.registeredAt.toISOString()),
    ]);

    const csvOutput = stringify([
      ['Registration ID', 'Name', 'Email', 'Phone', 'Status', 'Waitlist Pos', 'Checked In At', 'Registered At'],
      ...rows,
    ]);

    await this.audit.log({
      actorId: adminId,
      action: 'admin.event.export_csv',
      targetType: 'event',
      targetId: eventId,
      ipAddress,
    });

    return csvOutput;
  }

  // ----------------------------------------------------
  // AUDIT LOGS (APPEND-ONLY QUERY & SAFE CSV EXPORT)
  // ----------------------------------------------------

  async getAuditLogs(params: {
    action?: string;
    actorId?: string;
    targetType?: string;
    from?: string;
    to?: string;
    ipAddress?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 50));
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.action) where.action = { contains: params.action };
    if (params.actorId) where.actorId = params.actorId;
    if (params.targetType) where.targetType = params.targetType;
    if (params.ipAddress) where.ipAddress = { contains: params.ipAddress };
    if (params.from || params.to) {
      where.timestamp = {};
      if (params.from) where.timestamp.gte = new Date(params.from);
      if (params.to) where.timestamp.lte = new Date(params.to);
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              adminLevel: true,
              profile: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    const items = logs.map((l) => ({
      id: l.id,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      reason: l.reason,
      ipAddress: l.ipAddress,
      metadata: l.metadata,
      timestamp: l.timestamp,
      actor: l.actor
        ? {
            id: l.actor.id,
            name: l.actor.profile?.name || l.actor.email,
            email: l.actor.email,
            adminLevel: l.actor.adminLevel,
          }
        : null,
    }));

    return { items, total, page, pageSize };
  }

  async exportAuditLogsCsv(adminId: string, ipAddress?: string): Promise<string> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 2000,
      include: {
        actor: { select: { email: true, profile: { select: { name: true } } } },
      },
    });

    const rows = logs.map((l) => [
      sanitizeCsvCell(l.id),
      sanitizeCsvCell(l.timestamp.toISOString()),
      sanitizeCsvCell(l.action),
      sanitizeCsvCell(l.actor?.profile?.name || l.actor?.email || 'System'),
      sanitizeCsvCell(l.targetType),
      sanitizeCsvCell(l.targetId || ''),
      sanitizeCsvCell(l.reason || ''),
      sanitizeCsvCell(l.ipAddress || ''),
    ]);

    const csvOutput = stringify([
      ['Log ID', 'Timestamp', 'Action', 'Actor', 'Target Type', 'Target ID', 'Reason', 'IP Address'],
      ...rows,
    ]);

    await this.audit.log({
      actorId: adminId,
      action: 'admin.audit_log.export_csv',
      targetType: 'audit_log',
      ipAddress,
    });

    return csvOutput;
  }
}
