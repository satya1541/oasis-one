import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { PostStatus, PostType, ReportReasonCategory, ReportTargetType } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async getPosts(params: {
    category?: string;
    tag?: string;
    status?: string;
    feed?: 'relevant' | 'recent';
    page?: number;
    pageSize?: number;
    viewerId: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    // Check blocked users
    const blocks = await this.prisma.memberBlock.findMany({
      where: {
        OR: [{ blockerId: params.viewerId }, { blockedId: params.viewerId }],
      },
    });
    const excludedUserIds = new Set(
      blocks.map((b) => (b.blockerId === params.viewerId ? b.blockedId : b.blockerId)),
    );

    const where: any = {
      status: params.status || PostStatus.published,
      authorId: { notIn: Array.from(excludedUserIds) },
    };

    if (params.category && params.category !== 'All') {
      where.category = params.category;
    }

    if (params.tag) {
      where.tags = {
        some: {
          tag: {
            name: params.tag,
            status: 'active',
          },
        },
      };
    }

    const [total, posts] = await Promise.all([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
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
                  city: true,
                },
              },
            },
          },
          tags: {
            include: { tag: true },
          },
          _count: {
            select: { responses: true },
          },
        },
      }),
    ]);

    const items = posts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.status === 'deleted' ? 'This post has been deleted by its author.' : p.body,
      category: p.category,
      type: p.type,
      status: p.status,
      isResolved: p.isResolved,
      resolvedAnswerId: p.resolvedAnswerId,
      editedAt: p.editedAt,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.profile?.name || 'Member',
        headline: p.author.profile?.headline,
        avatarUrl: p.author.profile?.profilePhotoUrl,
        city: p.author.profile?.city,
        primaryRole: p.author.primaryRole,
        role: p.author.primaryRole,
      },
      tags: p.tags.map((t) => t.tag.name),
      responseCount: p._count.responses,
    }));

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async createPost(userId: string, dto: {
    title: string;
    body: string;
    category?: string;
    type?: PostType;
    tags?: string[];
  }) {
    if (!dto.title || dto.title.length > 200) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Title is required (max 200 chars)' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    if (!dto.body || dto.body.length > 10000) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Body is required (max 10,000 chars)' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        title: dto.title.trim(),
        body: dto.body.trim(),
        category: dto.category || 'Collaboration',
        type: dto.type || PostType.question,
        status: PostStatus.published, // No approval required for posts
      },
    });

    if (dto.tags && dto.tags.length > 0) {
      for (const tagName of dto.tags) {
        const tag = await this.prisma.expertiseTag.findUnique({ where: { name: tagName } });
        if (tag) {
          await this.prisma.postTag.create({
            data: { postId: post.id, tagId: tag.id },
          }).catch(() => {});
        }
      }
    }

    const fullPost = await this.prisma.post.findUnique({
      where: { id: post.id },
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
                city: true,
              },
            },
          },
        },
        tags: { include: { tag: true } },
      },
    });

    return {
      id: fullPost!.id,
      title: fullPost!.title,
      body: fullPost!.body,
      category: fullPost!.category,
      type: fullPost!.type,
      status: fullPost!.status,
      isResolved: fullPost!.isResolved,
      resolvedAnswerId: fullPost!.resolvedAnswerId,
      createdAt: fullPost!.createdAt,
      author: {
        id: fullPost!.author.id,
        name: fullPost!.author.profile?.name || 'Member',
        headline: fullPost!.author.profile?.headline,
        avatarUrl: fullPost!.author.profile?.profilePhotoUrl,
        city: fullPost!.author.profile?.city,
        primaryRole: fullPost!.author.primaryRole,
        role: fullPost!.author.primaryRole,
      },
      tags: fullPost!.tags.map((t) => t.tag.name),
      responseCount: 0,
    };
  }

  async getPostById(postId: string, viewerId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
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
                city: true,
              },
            },
          },
        },
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Post not found' }, HttpStatus.NOT_FOUND);
    }

    return {
      ...post,
      body: post.status === 'deleted' ? 'This post has been removed by its author.' : post.body,
      isOwner: post.authorId === viewerId,
      tags: post.tags.map((t) => t.tag.name),
      author: {
        id: post.author.id,
        name: post.author.profile?.name || 'Member',
        headline: post.author.profile?.headline,
        avatarUrl: post.author.profile?.profilePhotoUrl,
        city: post.author.profile?.city,
        primaryRole: post.author.primaryRole,
        role: post.author.primaryRole,
      },
    };
  }

  async updatePost(postId: string, userId: string, newBody: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new HttpException({ code: 'NOT_FOUND', message: 'Post not found' }, HttpStatus.NOT_FOUND);
    if (post.authorId !== userId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'You can only edit your own posts' }, HttpStatus.FORBIDDEN);
    }

    // 24-hour edit window
    const now = new Date();
    const createdAt = new Date(post.createdAt);
    if (now.getTime() - createdAt.getTime() > 24 * 60 * 60 * 1000) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Posts can only be edited within 24 hours of publishing' },
        HttpStatus.FORBIDDEN,
      );
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        originalBody: post.originalBody || post.body,
        body: newBody,
        editedAt: now,
      },
    });

    return updated;
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new HttpException({ code: 'NOT_FOUND', message: 'Post not found' }, HttpStatus.NOT_FOUND);
    if (post.authorId !== userId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'You can only delete your own posts' }, HttpStatus.FORBIDDEN);
    }

    // Soft delete
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: PostStatus.deleted },
    });

    return { ok: true, message: 'Post deleted' };
  }

  async getResponses(postId: string) {
    const responses = await this.prisma.postResponse.findMany({
      where: { postId, status: { in: ['published', 'deleted'] } },
      orderBy: { createdAt: 'asc' },
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
                city: true,
              },
            },
          },
        },
      },
    });

    return responses.map((r) => ({
      id: r.id,
      postId: r.postId,
      body: r.status === 'deleted' ? 'This response was deleted by author.' : r.body,
      status: r.status,
      createdAt: r.createdAt,
      author: {
        id: r.author.id,
        name: r.author.profile?.name || 'Member',
        headline: r.author.profile?.headline,
        avatarUrl: r.author.profile?.profilePhotoUrl,
        city: r.author.profile?.city,
        primaryRole: r.author.primaryRole,
        role: r.author.primaryRole,
      },
    }));
  }

  async createResponse(postId: string, userId: string, body: string) {
    if (!body || body.length > 5000) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Response body is required (max 5,000 chars)' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'published') {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Post not available' }, HttpStatus.NOT_FOUND);
    }

    const response = await this.prisma.postResponse.create({
      data: {
        postId,
        authorId: userId,
        body: body.trim(),
        status: PostStatus.published,
      },
    });

    // Realtime notification
    this.realtime.emit(`post:${postId}`, 'post.response_added', {
      postId,
      responseId: response.id,
    });

    // In-app notification to author if author is not respondent
    if (post.authorId !== userId) {
      const notif = await this.prisma.notification.create({
        data: {
          type: 'post_reply',
          title: 'New Reply to Your Post',
          body: `Someone replied to your post: "${post.title.slice(0, 50)}..."`,
          metadata: { postId, responseId: response.id },
        },
      });

      await this.prisma.notificationDelivery.create({
        data: {
          notificationId: notif.id,
          recipientId: post.authorId,
        },
      });

      this.realtime.emitToUser(post.authorId, 'notification.new', {
        id: notif.id,
        type: 'post_reply',
      });
    }

    return response;
  }

  async resolvePost(postId: string, userId: string, acceptedResponseId?: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new HttpException({ code: 'NOT_FOUND', message: 'Post not found' }, HttpStatus.NOT_FOUND);
    if (post.authorId !== userId) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Only author can resolve the post' }, HttpStatus.FORBIDDEN);
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        isResolved: true,
        resolvedAnswerId: acceptedResponseId || null,
      },
    });

    return updated;
  }

  async createReport(reporterId: string, dto: {
    targetType: ReportTargetType;
    targetId: string;
    reasonCategory: ReportReasonCategory;
    reasonDetail?: string;
  }) {
    const report = await this.prisma.contentReport.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reasonCategory: dto.reasonCategory,
        reasonDetail: dto.reasonDetail || null,
        status: 'pending',
      },
    });

    this.realtime.debounceEmitAdminCounts();
    return report;
  }
}
