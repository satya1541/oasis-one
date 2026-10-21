import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile as MulterFile,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminLevelGuard } from '../common/guards/admin-level.guard';
import { RequireAdminLevel, AdminLevel } from '../common/decorators/admin-level.decorator';
import { ConfigService } from '@nestjs/config';
import { LegalDocType, PostStatus, UserRole, AccountStatus } from '@prisma/client';
import { generateRandomToken } from '../common/utils/crypto.util';

@Controller('admin')
export class AdminController {
  private readonly frontendUrl: string;

  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config.get<string>('frontendUrl') || 'https://oasisodisha.in';
  }

  // 1. One-time Bootstrap (Public)
  @Public()
  @Post('setup')
  async setupInitialAdmin(@Body() body: any) {
    if (!body?.token || !body?.email || !body?.password || !body?.name) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Token, email, password, and name are required' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return this.adminService.setupInitialAdmin(body);
  }

  // 2. Overview
  @UseGuards(AdminGuard)
  @Get('overview')
  async getOverview() {
    return this.adminService.getOverview();
  }

  @UseGuards(AdminGuard)
  @Get('analytics')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  // 3. Applications
  @UseGuards(AdminGuard)
  @Get('applications')
  async getApplications(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getApplications(
      status,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @UseGuards(AdminGuard)
  @Get('applications/:id')
  async getApplicationById(@Param('id') id: string) {
    return this.adminService.getApplicationById(id);
  }

  @UseGuards(AdminGuard)
  @Post('applications/:id/claim')
  async claimApplication(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.claimApplication(id, adminId);
  }

  @UseGuards(AdminGuard)
  @Post('applications/:id/release')
  async releaseApplication(
    @Param('id') id: string,
    @CurrentUser() admin: any,
  ) {
    const isSuperAdmin = admin.adminLevel === 'super_admin';
    return this.adminService.releaseApplication(id, admin.id, isSuperAdmin);
  }

  @UseGuards(AdminGuard)
  @Post('applications/:id/decision')
  async decideApplication(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.decideApplication(id, adminId, body, clientIp);
  }

  @UseGuards(AdminGuard)
  @Post('applications/:id/messages')
  async addApplicationMessage(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { body: string; isInternalNote?: boolean },
  ) {
    return this.adminService.addApplicationMessage(id, adminId, body);
  }

  // 4. Members & Restrictions
  @UseGuards(AdminGuard)
  @Get('members')
  async getMembers(
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getMembers({
      q,
      role,
      status,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @UseGuards(AdminGuard)
  @Get('members/:id')
  async getMemberById(@Param('id') id: string) {
    return this.adminService.getMemberById(id);
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Patch('members/:id/role')
  async changeMemberRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.changeMemberRole(id, role, adminId, clientIp);
  }

  @UseGuards(AdminGuard)
  @Post('members/:id/restrictions')
  async issueRestriction(
    @Param('id') id: string,
    @CurrentUser() admin: any,
    @Body() body: any,
    @Req() req: Request,
  ) {
    if (['blacklist', 'revocation'].includes(body?.type) && admin.adminLevel !== 'super_admin') {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Only Super Admins can revoke or blacklist accounts' }, HttpStatus.FORBIDDEN);
    }
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.issueRestriction(id, admin.id, body, clientIp);
  }

  @UseGuards(AdminGuard)
  @Post('restrictions/:id/resolve')
  async resolveRestriction(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.resolveRestriction(id, adminId, clientIp);
  }

  @UseGuards(AdminGuard)
  @Patch('members/:id/mentor-verification')
  async toggleMentorVerification(
    @Param('id') id: string,
    @Body('isVerified') isVerified: boolean,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.toggleMentorVerification(id, isVerified, adminId, clientIp);
  }

  // 5. Profile Changes (PROF-02)
  @UseGuards(AdminGuard)
  @Get('profile-changes')
  async getProfileChanges() {
    return this.prisma.profileChangeRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: { select: { id: true, email: true, profile: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(AdminGuard)
  @Post('profile-changes/:id/decision')
  async decideProfileChange(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body('decision') decision: 'approve' | 'reject',
  ) {
    const reqItem = await this.prisma.profileChangeRequest.findUnique({ where: { id } });
    if (!reqItem) throw new HttpException({ code: 'NOT_FOUND', message: 'Change request not found' }, HttpStatus.NOT_FOUND);

    if (decision === 'approve') {
      await this.prisma.$transaction([
        this.prisma.profileChangeRequest.update({
          where: { id },
          data: { status: 'approved', reviewedBy: adminId, reviewedAt: new Date() },
        }),
        this.prisma.profile.update({
          where: { userId: reqItem.userId },
          data: { [reqItem.fieldKey]: reqItem.proposedValue },
        }),
      ]);
    } else {
      await this.prisma.profileChangeRequest.update({
        where: { id },
        data: { status: 'rejected', reviewedBy: adminId, reviewedAt: new Date() },
      });
    }

    return { ok: true, decision };
  }

  // 6. Reports & Content Moderation
  @UseGuards(AdminGuard)
  @Get('reports')
  async getReports() {
    return this.prisma.contentReport.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, email: true, profile: { select: { name: true } } } },
      },
    });
  }

  @UseGuards(AdminGuard)
  @Post('reports/:id/resolve')
  async resolveReport(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { outcome: 'resolved' | 'dismissed'; notes?: string },
  ) {
    const updated = await this.prisma.contentReport.update({
      where: { id },
      data: {
        status: body.outcome,
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolutionNotes: body.notes || null,
      },
    });

    this.realtime.debounceEmitAdminCounts();
    return updated;
  }

  @UseGuards(AdminGuard)
  @Post('posts/:id/hide')
  async hidePost(@Param('id') id: string) {
    return this.prisma.post.update({ where: { id }, data: { status: PostStatus.hidden } });
  }

  @UseGuards(AdminGuard)
  @Post('posts/:id/restore')
  async restorePost(@Param('id') id: string) {
    return this.prisma.post.update({ where: { id }, data: { status: PostStatus.published } });
  }

  @UseGuards(AdminGuard)
  @Post('responses/:id/hide')
  async hideResponse(@Param('id') id: string) {
    return this.prisma.postResponse.update({ where: { id }, data: { status: PostStatus.hidden } });
  }

  @UseGuards(AdminGuard)
  @Post('responses/:id/restore')
  async restoreResponse(@Param('id') id: string) {
    return this.prisma.postResponse.update({ where: { id }, data: { status: PostStatus.published } });
  }

  // 7. Achievements
  @UseGuards(AdminGuard)
  @Get('achievements')
  async getAchievements(@Query('status') status?: string) {
    const where: any = status ? { status: status as any } : {};
    return this.prisma.achievement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, email: true, profile: { select: { name: true } } } },
      },
    });
  }

  @UseGuards(AdminGuard)
  @Post('achievements/:id/decision')
  async decideAchievement(
    @Param('id') id: string,
    @Body() body: { decision: 'approve' | 'reject' | 'remove'; reason?: string },
  ) {
    const now = new Date();
    if (body.decision === 'approve') {
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // approved_at + 24h
      const updated = await this.prisma.achievement.update({
        where: { id },
        data: {
          status: 'approved',
          approvedAt: now,
          expiresAt,
        },
      });
      this.realtime.emitToMembers('achievement.live', { achievementId: id });
      this.realtime.debounceEmitAdminCounts();
      return updated;
    } else if (body.decision === 'reject') {
      const updated = await this.prisma.achievement.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason: body.reason || null,
        },
      });
      this.realtime.debounceEmitAdminCounts();
      return updated;
    } else {
      // remove
      return this.prisma.achievement.update({
        where: { id },
        data: { status: 'archived' },
      });
    }
  }

  // 8. Events
  @UseGuards(AdminGuard)
  @Get('events')
  async getAdminEvents() {
    return this.prisma.event.findMany({
      orderBy: { startAt: 'desc' },
      include: {
        _count: { select: { registrations: true } },
      },
    });
  }

  @UseGuards(AdminGuard)
  @Post('events')
  async createEvent(
    @CurrentUser('id') adminId: string,
    @Body() body: any,
  ) {
    return this.prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startAt: new Date(body.startAt),
        endAt: new Date(body.endAt),
        venueOrLink: body.venueOrLink || null,
        meetingLink: body.meetingLink || null,
        capacity: body.capacity ? parseInt(body.capacity, 10) : null,
        waitlistEnabled: body.waitlistEnabled !== false,
        registrationDeadline: body.registrationDeadline ? new Date(body.registrationDeadline) : null,
        visibility: body.visibility || 'all_members',
        visibleToRoles: body.visibleToRoles || undefined,
        status: 'draft',
        createdBy: adminId,
      },
    });
  }

  @UseGuards(AdminGuard)
  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() body: any) {
    const updateData: any = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.startAt) updateData.startAt = new Date(body.startAt);
    if (body.endAt) updateData.endAt = new Date(body.endAt);
    if (body.venueOrLink !== undefined) updateData.venueOrLink = body.venueOrLink;
    if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
    if (body.capacity !== undefined) updateData.capacity = body.capacity ? parseInt(body.capacity, 10) : null;
    if (body.waitlistEnabled !== undefined) updateData.waitlistEnabled = body.waitlistEnabled;
    if (body.registrationDeadline !== undefined) {
      updateData.registrationDeadline = body.registrationDeadline ? new Date(body.registrationDeadline) : null;
    }
    if (body.visibility) updateData.visibility = body.visibility;

    const updated = await this.prisma.event.update({
      where: { id },
      data: updateData,
    });

    this.realtime.emit(`event:${id}`, 'event.updated', { eventId: id, change: 'details' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Post('events/:id/publish')
  async publishEvent(@Param('id') id: string) {
    const updated = await this.prisma.event.update({ where: { id }, data: { status: 'published' } });
    this.realtime.emitToMembers('event.updated', { eventId: id, change: 'published' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Post('events/:id/cancel')
  async cancelEvent(@Param('id') id: string) {
    const updated = await this.prisma.event.update({ where: { id }, data: { status: 'cancelled' } });
    this.realtime.emit(`event:${id}`, 'event.updated', { eventId: id, change: 'cancelled' });
    return updated;
  }

  @UseGuards(AdminGuard)
  @Post('events/:id/archive')
  async archiveEvent(@Param('id') id: string) {
    return this.prisma.event.update({ where: { id }, data: { status: 'archived' } });
  }

  @UseGuards(AdminGuard)
  @Put('events/:id/form')
  async setEventForm(
    @Param('id') eventId: string,
    @Body('fields') fields: Array<{ fieldLabel: string; fieldType: string; required?: boolean; options?: any; displayOrder?: number }>,
  ) {
    await this.prisma.eventFormField.deleteMany({ where: { eventId } });
    if (fields && fields.length > 0) {
      for (const [idx, f] of fields.entries()) {
        await this.prisma.eventFormField.create({
          data: {
            eventId,
            fieldLabel: f.fieldLabel,
            fieldType: f.fieldType,
            required: f.required || false,
            options: f.options || undefined,
            displayOrder: f.displayOrder !== undefined ? f.displayOrder : idx,
          },
        });
      }
    }
    return this.prisma.eventFormField.findMany({ where: { eventId }, orderBy: { displayOrder: 'asc' } });
  }

  @UseGuards(AdminGuard)
  @Put('events/:id/invitees')
  async setEventInvitees(
    @Param('id') eventId: string,
    @Body('userIds') userIds: string[],
  ) {
    await this.prisma.eventInvitee.deleteMany({ where: { eventId } });
    if (userIds && userIds.length > 0) {
      for (const userId of userIds) {
        await this.prisma.eventInvitee.create({
          data: { eventId, userId },
        }).catch(() => {});
      }
    }
    return { ok: true, count: userIds.length };
  }

  @UseGuards(AdminGuard)
  @Get('events/:id/registrations')
  async getEventRegistrations(@Param('id') eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: { select: { id: true, email: true, profile: { select: { name: true, city: true } } } },
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  @UseGuards(AdminGuard)
  @Post('events/:id/registrations/:regId/check-in')
  async checkInRegistration(
    @Param('regId') regId: string,
  ) {
    return this.prisma.eventRegistration.update({
      where: { id: regId },
      data: { checkedInAt: new Date() },
    });
  }

  @UseGuards(AdminGuard)
  @Get('events/:id/export.csv')
  async exportEventCsv(
    @Param('id') eventId: string,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const csvData = await this.adminService.exportEventAttendeesCsv(eventId, adminId, clientIp);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}-attendees.csv"`);
    return res.send(csvData);
  }

  // 9. Announcements
  @UseGuards(AdminGuard)
  @Get('announcements')
  async getAnnouncements() {
    return this.prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(AdminGuard)
  @Post('announcements')
  async createAnnouncement(
    @CurrentUser('id') adminId: string,
    @Body() body: { title: string; body: string; targetRoles?: string[]; expiresAt?: string },
  ) {
    const ann = await this.prisma.announcement.create({
      data: {
        title: body.title,
        body: body.body,
        targetRoles: body.targetRoles || undefined,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        createdBy: adminId,
      },
    });

    if (body.targetRoles && body.targetRoles.length > 0) {
      for (const r of body.targetRoles) {
        this.realtime.emitToRole(r, 'announcement.new', { announcementId: ann.id });
      }
    } else {
      this.realtime.emitToMembers('announcement.new', { announcementId: ann.id });
    }

    return ann;
  }

  // 10. Taxonomy (Tags & Merge)
  @UseGuards(AdminGuard)
  @Post('taxonomy/tags')
  async createTag(@CurrentUser('id') adminId: string, @Body() body: any) {
    return this.prisma.expertiseTag.create({
      data: {
        name: body.name.trim(),
        category: body.category || 'general',
        status: 'active',
        createdBy: adminId,
      },
    });
  }

  @UseGuards(AdminGuard)
  @Patch('taxonomy/tags/:id')
  async updateTag(@Param('id') id: string, @Body() body: any) {
    return this.prisma.expertiseTag.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.status && { status: body.status }),
      },
    });
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Post('taxonomy/tags/:id/merge')
  async mergeTag(
    @Param('id') sourceTagId: string,
    @Body('targetTagId') targetTagId: string,
  ) {
    // Reassign relations to targetTag, then retire sourceTag
    await this.prisma.$transaction(async (tx) => {
      // Profiles
      const profileTags = await tx.profileTag.findMany({ where: { tagId: sourceTagId } });
      for (const pt of profileTags) {
        await tx.profileTag.upsert({
          where: { profileId_tagId: { profileId: pt.profileId, tagId: targetTagId } },
          update: {},
          create: { profileId: pt.profileId, tagId: targetTagId },
        });
      }
      await tx.profileTag.deleteMany({ where: { tagId: sourceTagId } });

      // Posts
      const postTags = await tx.postTag.findMany({ where: { tagId: sourceTagId } });
      for (const pt of postTags) {
        await tx.postTag.upsert({
          where: { postId_tagId: { postId: pt.postId, tagId: targetTagId } },
          update: {},
          create: { postId: pt.postId, tagId: targetTagId },
        });
      }
      await tx.postTag.deleteMany({ where: { tagId: sourceTagId } });

      // Retire source tag
      await tx.expertiseTag.update({
        where: { id: sourceTagId },
        data: { status: 'retired' },
      });
    });

    return { ok: true, message: 'Tag merged and source tag retired' };
  }

  // 11. Migration CSV Import & Invites
  @UseGuards(AdminGuard)
  @Post('invites/import')
  @UseInterceptors(FileInterceptor('file'))
  async importInvites(
    @MulterFile() file: Express.Multer.File,
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'CSV file required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.adminService.importInvitesCsv(file.buffer, adminId, clientIp);
  }

  @UseGuards(AdminGuard)
  @Get('invites')
  async getInvites() {
    return this.prisma.inviteLink.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(AdminGuard)
  @Post('invites/:id/resend')
  async resendInvite(@Param('id') inviteId: string) {
    const invite = await this.prisma.inviteLink.findUnique({ where: { id: inviteId } });
    if (!invite) throw new HttpException({ code: 'NOT_FOUND', message: 'Invite not found' }, HttpStatus.NOT_FOUND);

    const rawToken = generateRandomToken(32);
    const tokenHash = (require('../common/utils/crypto.util')).hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    await this.prisma.inviteLink.update({
      where: { id: inviteId },
      data: { tokenHash, expiresAt, status: 'pending' },
    });

    const inviteUrl = `${this.frontendUrl}/invite/${rawToken}`;
    this.adminService['mail'].sendMail({
      to: invite.email,
      subject: 'OASIS ONE Invitation Reminder',
      headline: `Hello ${invite.name || 'Member'},`,
      body: `Your invitation to join the OASIS ONE private network is waiting. Click below to claim your account.`,
      actionText: 'Activate Account',
      actionUrl: inviteUrl,
    });

    return { ok: true, message: 'Invite resent' };
  }

  // 12. Startups
  @UseGuards(AdminGuard)
  @Get('startups')
  async getAdminStartups() {
    return this.prisma.startup.findMany({
      include: {
        members: { include: { user: { select: { id: true, profile: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(AdminGuard)
  @Post('startups/merge')
  async mergeStartups(@Body() body: { sourceStartupId: string; targetStartupId: string }) {
    await this.prisma.$transaction(async (tx) => {
      const sourceMembers = await tx.startupMember.findMany({ where: { startupId: body.sourceStartupId } });
      for (const sm of sourceMembers) {
        await tx.startupMember.upsert({
          where: { startupId_userId: { startupId: body.targetStartupId, userId: sm.userId } },
          update: {},
          create: { startupId: body.targetStartupId, userId: sm.userId, roleInStartup: sm.roleInStartup },
        });
      }
      await tx.startupMember.deleteMany({ where: { startupId: body.sourceStartupId } });
      await tx.startup.delete({ where: { id: body.sourceStartupId } });
    });
    return { ok: true, message: 'Startups merged' };
  }

  // 13. Audit Log (Super Admin)
  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('audit-log')
  async getAuditLog(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const take = Math.min(50, Math.max(1, Number(pageSize) || 20));
    const skip = (pageNum - 1) * take;

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { timestamp: 'desc' },
        include: {
          actor: { select: { id: true, email: true, profile: { select: { name: true } } } },
        },
      }),
    ]);

    return { items: logs, total, page: pageNum, pageSize: take };
  }

  // 14. Legal Documents (Super Admin)
  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('legal')
  async getLegalDocs() {
    return this.prisma.legalDocument.findMany({ orderBy: { publishedAt: 'desc' } });
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Post('legal')
  async publishLegalDoc(
    @CurrentUser('id') adminId: string,
    @Body() body: { type: LegalDocType; version: string; title: string; body: string },
  ) {
    // Set old versions of this type to isCurrent: false
    await this.prisma.legalDocument.updateMany({
      where: { type: body.type },
      data: { isCurrent: false },
    });

    const doc = await this.prisma.legalDocument.create({
      data: {
        type: body.type,
        version: body.version,
        title: body.title,
        body: body.body,
        isCurrent: true,
        publishedBy: adminId,
      },
    });

    // Notify all active members of terms update
    this.realtime.emitToMembers('legal.updated', {});

    return doc;
  }

  // 15. Settings (Super Admin)
  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('settings')
  async getSettings() {
    return this.prisma.setting.findMany();
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Put('settings')
  async updateSettings(@Body() body: Record<string, string>) {
    for (const [key, value] of Object.entries(body)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    return this.prisma.setting.findMany();
  }

  // 16. Admin User Management (Super Admin)
  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('admins')
  async getAdmins() {
    return this.prisma.user.findMany({
      where: { adminLevel: { not: null } },
      select: {
        id: true,
        email: true,
        adminLevel: true,
        accountStatus: true,
        lastLoginAt: true,
        profile: { select: { name: true } },
      },
    });
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Post('admins')
  async createAdmin(
    @CurrentUser('id') adminId: string,
    @Body() body: { email: string; name: string; adminLevel: AdminLevel },
    @Req() req: Request,
  ) {
    const email = body.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Promote existing user
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { adminLevel: body.adminLevel },
      });
      return { ok: true, message: 'Existing user promoted to admin' };
    }

    // Create new admin-only account (primaryRole = null, applicationStatus = approved)
    const user = await this.prisma.user.create({
      data: {
        email,
        adminLevel: body.adminLevel,
        accountStatus: AccountStatus.active,
        emailVerified: true,
        profile: { create: { name: body.name } },
      },
    });

    // Send set-password link
    const rawToken = (require('../common/utils/crypto.util')).generateRandomToken(32);
    const tokenHash = (require('../common/utils/crypto.util')).hashToken(rawToken);

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        email,
        tokenHash,
        type: 'set_password',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const setPasswordUrl = `${this.frontendUrl}/reset-password?token=${rawToken}`;
    this.adminService['mail'].sendMail({
      to: email,
      subject: 'OASIS ONE Administrative Access Granted',
      headline: 'Administrative Invitation',
      body: `You have been added as an administrator (${body.adminLevel}) on OASIS ONE. Click below to configure your password and enroll in mandatory MFA.`,
      actionText: 'Set Password & Enroll',
      actionUrl: setPasswordUrl,
    });

    return { ok: true, adminId: user.id };
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Patch('admins/:id')
  async updateAdmin(
    @Param('id') id: string,
    @CurrentUser('id') currentAdminId: string,
    @Body() body: { adminLevel?: AdminLevel | null; accountStatus?: AccountStatus },
    @Req() req: Request,
  ) {
    if (id === currentAdminId && body.adminLevel === null) {
      throw new HttpException({ code: 'CONFLICT', message: 'You cannot revoke your own super admin access' }, HttpStatus.CONFLICT);
    }
    const updateData: any = {};
    if (body.adminLevel !== undefined) {
      updateData.adminLevel = body.adminLevel;
    }
    if (body.accountStatus !== undefined) {
      updateData.accountStatus = body.accountStatus;
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        adminLevel: true,
        accountStatus: true,
        lastLoginAt: true,
        profile: { select: { name: true } },
      },
    });

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    await this.prisma.auditLog.create({
      data: {
        actorId: currentAdminId,
        action: 'admin_user_updated',
        targetType: 'user',
        targetId: id,
        metadata: { changes: body, targetEmail: updated.email },
        ipAddress: clientIp,
      },
    });

    return updated;
  }

  // 17. Audit Logs Query & CSV Export (Super Admin)
  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('audit-logs')
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('targetType') targetType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('ipAddress') ipAddress?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.adminService.getAuditLogs({
      action,
      actorId,
      targetType,
      from,
      to,
      ipAddress,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 50,
    });
  }

  @UseGuards(AdminGuard, AdminLevelGuard)
  @RequireAdminLevel(AdminLevel.super_admin)
  @Get('audit-logs/export')
  async exportAuditLogs(
    @CurrentUser('id') adminId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const csvData = await this.adminService.exportAuditLogsCsv(adminId, clientIp);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="oasis_audit_log_${Date.now()}.csv"`);
    res.send(csvData);
  }
}
