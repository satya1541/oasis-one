import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { FilesService } from '../files/files.service';
import { FilePurpose } from '@prisma/client';

export type ViewerContext = 'self' | 'connected' | 'member' | 'admin';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly filesService: FilesService,
  ) {}

  async getDirectory(params: {
    q?: string;
    role?: string;
    sector?: string;
    expertise?: string;
    location?: string;
    page?: number;
    pageSize?: number;
    viewerId: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    // Exclude users blocked by viewer or who blocked viewer
    const blockedRecords = await this.prisma.memberBlock.findMany({
      where: {
        OR: [{ blockerId: params.viewerId }, { blockedId: params.viewerId }],
      },
    });
    const excludedUserIds = new Set(
      blockedRecords.map((b) => (b.blockerId === params.viewerId ? b.blockedId : b.blockerId)),
    );
    if (params.viewerId) {
      excludedUserIds.add(params.viewerId);
    }

    const where: any = {
      user: {
        accountStatus: 'active',
        adminLevel: null,
        id: { notIn: Array.from(excludedUserIds) },
      },
    };

    if (params.role) {
      where.user.primaryRole = params.role;
    }

    if (params.location) {
      where.OR = [
        { city: { contains: params.location } },
        { state: { contains: params.location } },
      ];
    }

    if (params.q) {
      where.OR = [
        { name: { contains: params.q } },
        { bio: { contains: params.q } },
        { headline: { contains: params.q } },
      ];
    }

    if (params.sector || params.expertise) {
      const tagName = params.sector || params.expertise;
      where.tags = {
        some: {
          tag: {
            name: tagName,
            status: 'active',
          },
        },
      };
    }

    const [total, profiles] = await Promise.all([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              primaryRole: true,
              accountStatus: true,
            },
          },
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Format profiles using member viewer context
    const items = profiles.map((p) => this.serializeProfile(p, 'member', params.viewerId));

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async getProfileById(targetUserId: string, viewerId: string, isAdmin = false, ipAddress?: string) {
    // Check blocks
    const block = await this.prisma.memberBlock.findFirst({
      where: {
        OR: [
          { blockerId: viewerId, blockedId: targetUserId },
          { blockerId: targetUserId, blockedId: viewerId },
        ],
      },
    });

    if (block && !isAdmin) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Profile unavailable' }, HttpStatus.NOT_FOUND);
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId: targetUserId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            primaryRole: true,
            accountStatus: true,
            adminLevel: true,
            timeZone: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!profile) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Profile not found' }, HttpStatus.NOT_FOUND);
    }

    if (profile.user?.adminLevel && !isAdmin && viewerId !== targetUserId) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Profile unavailable' }, HttpStatus.NOT_FOUND);
    }

    // Determine viewer context
    let context: ViewerContext = 'member';
    if (viewerId === targetUserId) {
      context = 'self';
    } else if (isAdmin) {
      context = 'admin';
      // Audit admin viewing private fields
      await this.audit.log({
        actorId: viewerId,
        action: 'admin.profile.view_private',
        targetType: 'user',
        targetId: targetUserId,
        ipAddress,
      });
    } else {
      const conn = await this.prisma.connectionRequest.findFirst({
        where: {
          OR: [
            { senderId: viewerId, recipientId: targetUserId, status: 'accepted' },
            { senderId: targetUserId, recipientId: viewerId, status: 'accepted' },
          ],
        },
      });
      if (conn) {
        context = 'connected';
      }
    }

    const serialized = this.serializeProfile(profile, context, viewerId);

    // Compute viewer metadata
    const connection = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: viewerId, recipientId: targetUserId },
          { senderId: targetUserId, recipientId: viewerId },
        ],
        status: { in: ['accepted', 'pending'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    let connectionStatus = 'none';
    if (connection) {
      if (connection.status === 'accepted') connectionStatus = 'connected';
      else if (connection.status === 'pending') {
        connectionStatus = connection.senderId === viewerId ? 'pending_out' : 'pending_in';
      }
    }

    const isMentor = profile.user.primaryRole === 'mentor';
    const isPaused = profile.mentorAvailability === 'paused';
    const canConnect =
      viewerId !== targetUserId &&
      (!isMentor || !isPaused) &&
      !block &&
      connectionStatus === 'none';

    return {
      ...serialized,
      viewer: {
        canConnect,
        connectionStatus,
        connectionId: connection ? connection.id : null,
        isBlocked: !!block,
      },
    };
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            primaryRole: true,
            accountStatus: true,
            timeZone: true,
          },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!profile) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Profile not found' }, HttpStatus.NOT_FOUND);
    }

    return this.serializeProfile(profile, 'self', userId);
  }

  async updateMyProfile(userId: string, updates: Record<string, any>) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Profile not found' }, HttpStatus.NOT_FOUND);
    }

    // Flagged fields (name, role, startupName, expertise) create ProfileChangeRequest (PROF-02)
    const flaggedFields = ['name', 'role', 'startupName'];
    const standardUpdates: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (flaggedFields.includes(key)) {
        await this.prisma.profileChangeRequest.create({
          data: {
            userId,
            fieldKey: key,
            currentValue: (profile as any)[key] || null,
            proposedValue: value,
            status: 'pending',
          },
        });
      } else {
        standardUpdates[key] = value;
      }
    }

    if (updates.timeZone) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { timeZone: updates.timeZone },
      });
      delete standardUpdates.timeZone;
    }

    const allowedColumns = [
      'headline',
      'bio',
      'city',
      'state',
      'country',
      'linkedinUrl',
      'twitterUrl',
      'githubUrl',
      'websiteUrl',
      'mentorAvailability',
      'maxMentees',
      'preferredContactMethod',
      'roleAttributes',
    ];

    const cleanData: Record<string, any> = {};
    for (const col of allowedColumns) {
      if (standardUpdates[col] !== undefined) {
        cleanData[col] = standardUpdates[col];
      }
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: cleanData,
    });

    return updated;
  }

  async updatePrivacy(userId: string, dto: { visibility?: any; contactPreferences?: any }) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.visibility && { visibilitySettings: dto.visibility }),
        ...(dto.contactPreferences && { contactPreferences: dto.contactPreferences }),
      },
    });
  }

  async uploadPhoto(userId: string, file: Express.Multer.File) {
    const uploaded = await this.filesService.uploadFile(file, FilePurpose.profile_photo, userId);
    const photoUrl = `/api/v1/files/attachment/${uploaded.id}`;

    await this.prisma.profile.update({
      where: { userId },
      data: {
        profilePhotoUrl: photoUrl,
        photoFileId: uploaded.id,
      },
    });

    return { photoUrl, photoFileId: uploaded.id };
  }

  async getMyDocuments(userId: string) {
    const files = await this.prisma.uploadedFile.findMany({
      where: {
        ownerId: userId,
        status: { not: 'deleted' },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        sizeBytes: true,
        purpose: true,
        createdAt: true,
      },
    });

    return files.map((f) => ({
      ...f,
      downloadUrl: `/api/v1/files/attachment/${f.id}`,
    }));
  }

  async uploadDocument(userId: string, file: Express.Multer.File, category?: string) {
    if (!file) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'No file provided' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const uploaded = await this.filesService.uploadFile(
      file,
      FilePurpose.verification_evidence,
      userId,
    );

    await this.prisma.uploadedFile.update({
      where: { id: uploaded.id },
      data: { status: 'attached' },
    });

    return {
      id: uploaded.id,
      filename: uploaded.filename,
      mimeType: uploaded.mimeType,
      sizeBytes: uploaded.sizeBytes,
      purpose: uploaded.purpose,
      createdAt: uploaded.createdAt,
      downloadUrl: `/api/v1/files/attachment/${uploaded.id}`,
    };
  }

  async deleteDocument(userId: string, fileId: string) {
    const file = await this.prisma.uploadedFile.findFirst({
      where: { id: fileId, ownerId: userId },
    });

    if (!file) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Document not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.prisma.uploadedFile.update({
      where: { id: fileId },
      data: { status: 'deleted' },
    });

    return { ok: true, message: 'Document deleted' };
  }

  private serializeProfile(profile: any, context: ViewerContext, viewerId: string) {
    const visibility = profile.visibilitySettings || {};
    const contactPrefs = profile.contactPreferences || {};

    const base = {
      id: profile.userId,
      name: profile.name,
      headline: profile.headline,
      bio: profile.bio,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      profilePhotoUrl: profile.profilePhotoUrl,
      primaryRole: profile.user?.primaryRole,
      role: profile.user?.primaryRole,
      mentorVerified: profile.mentorVerified,
      mentorAvailability: profile.mentorAvailability,
      preferredContactMethod: profile.preferredContactMethod,
      tags: profile.tags?.map((t: any) => t.tag) || [],
      roleAttributes: profile.roleAttributes,
    };

    if (context === 'self' || context === 'admin') {
      return {
        ...base,
        email: profile.user?.email,
        phone: profile.user?.phone,
        timeZone: profile.user?.timeZone,
        linkedinUrl: profile.linkedinUrl,
        twitterUrl: profile.twitterUrl,
        githubUrl: profile.githubUrl,
        websiteUrl: profile.websiteUrl,
        visibilitySettings: profile.visibilitySettings,
        contactPreferences: profile.contactPreferences,
      };
    }

    if (context === 'connected') {
      const shareEmail = contactPrefs.shareEmailOnConnect !== false;
      const sharePhone = !!contactPrefs.sharePhoneOnConnect;
      return {
        ...base,
        email: shareEmail ? profile.user?.email : undefined,
        phone: sharePhone ? profile.user?.phone : undefined,
        linkedinUrl: profile.linkedinUrl,
        twitterUrl: profile.twitterUrl,
        githubUrl: profile.githubUrl,
        websiteUrl: profile.websiteUrl,
      };
    }

    // Default 'member' context
    return {
      ...base,
      linkedinUrl: visibility.linkedin === 'members' ? profile.linkedinUrl : undefined,
      email: visibility.email === 'members' ? profile.user?.email : undefined,
      phone: visibility.phone === 'members' ? profile.user?.phone : undefined,
    };
  }

  async getCommunityStats() {
    const [activeMembers, totalMembers] = await Promise.all([
      this.prisma.user.count({
        where: { accountStatus: 'active', adminLevel: null },
      }),
      this.prisma.user.count({
        where: { adminLevel: null },
      }),
    ]);

    return {
      activeMembers,
      totalMembers,
    };
  }
}
