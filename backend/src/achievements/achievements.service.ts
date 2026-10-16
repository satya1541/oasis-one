import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AchievementStatus, FilePurpose } from '@prisma/client';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
    private readonly realtime: RealtimeService,
  ) {}

  async getActiveAchievements() {
    const now = new Date();
    // Read-time filtering: status = 'approved' and expiresAt > now
    const achievements = await this.prisma.achievement.findMany({
      where: {
        status: AchievementStatus.approved,
        expiresAt: { gt: now },
      },
      orderBy: { approvedAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            primaryRole: true,
            profile: {
              select: {
                name: true,
                headline: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });

    return achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      mediaUrl: a.mediaUrl,
      approvedAt: a.approvedAt,
      expiresAt: a.expiresAt,
      author: {
        id: a.author.id,
        name: a.author.profile?.name || 'Member',
        headline: a.author.profile?.headline,
        avatarUrl: a.author.profile?.profilePhotoUrl,
        role: a.author.primaryRole,
      },
    }));
  }

  async getMyAchievements(userId: string) {
    return this.prisma.achievement.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAchievement(
    userId: string,
    title: string,
    description: string,
    file?: Express.Multer.File,
  ) {
    if (!title || title.length > 200) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Title is required (max 200)' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (!description || description.length > 500) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Description is required (max 500 chars)' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    let mediaUrl: string | undefined = undefined;
    let mediaType: string | undefined = undefined;

    if (file) {
      const uploaded = await this.filesService.uploadFile(file, FilePurpose.achievement_media, userId);
      mediaUrl = `/api/v1/files/${this.filesService.generateSignedDownloadToken(uploaded.id, userId, 86400 * 7)}`;
      mediaType = file.mimetype;
    }

    const achievement = await this.prisma.achievement.create({
      data: {
        authorId: userId,
        title: title.trim(),
        description: description.trim(),
        mediaUrl,
        mediaType,
        status: AchievementStatus.pending_review,
      },
    });

    this.realtime.debounceEmitAdminCounts();
    return achievement;
  }
}
