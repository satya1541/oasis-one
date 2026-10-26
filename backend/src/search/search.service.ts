import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sanitizeFulltextQuery } from '../common/utils/crypto.util';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(params: {
    q: string;
    type?: 'people' | 'posts' | 'events';
    page?: number;
    pageSize?: number;
    viewerId: string;
  }) {
    const rawQ = params.q?.trim() || '';
    const cleanQ = sanitizeFulltextQuery(rawQ);
    const booleanModeTerm = cleanQ ? `${cleanQ}*` : '';
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    // Get blocked users
    const blocks = await this.prisma.memberBlock.findMany({
      where: {
        OR: [{ blockerId: params.viewerId }, { blockedId: params.viewerId }],
      },
    });
    const excludedUserIds = new Set(
      blocks.map((b) => (b.blockerId === params.viewerId ? b.blockedId : b.blockerId)),
    );
    if (params.viewerId) {
      excludedUserIds.add(params.viewerId);
    }

    let peopleItems: any[] = [];
    let peopleTotal = 0;
    let postItems: any[] = [];
    let postTotal = 0;
    let eventItems: any[] = [];
    let eventTotal = 0;

    const searchPeople = !params.type || params.type === 'people';
    const searchPosts = !params.type || params.type === 'posts';
    const searchEvents = !params.type || params.type === 'events';

    if (searchPeople) {
      const wherePeople: any = {
        user: {
          accountStatus: 'active',
          adminLevel: null,
          id: { notIn: Array.from(excludedUserIds) },
        },
      };

      if (cleanQ) {
        wherePeople.OR = [
          { name: { contains: cleanQ } },
          { bio: { contains: cleanQ } },
          { headline: { contains: cleanQ } },
          { city: { contains: cleanQ } },
        ];
      }

      [peopleTotal, peopleItems] = await Promise.all([
        this.prisma.profile.count({ where: wherePeople }),
        this.prisma.profile.findMany({
          where: wherePeople,
          skip,
          take: pageSize,
          select: {
            userId: true,
            name: true,
            headline: true,
            city: true,
            profilePhotoUrl: true,
            mentorVerified: true,
            user: {
              select: {
                primaryRole: true,
              },
            },
          },
        }),
      ]);
    }

    if (searchPosts) {
      const wherePosts: any = {
        status: 'published',
        authorId: { notIn: Array.from(excludedUserIds) },
      };

      if (cleanQ) {
        wherePosts.OR = [
          { title: { contains: cleanQ } },
          { body: { contains: cleanQ } },
          { category: { contains: cleanQ } },
        ];
      }

      [postTotal, postItems] = await Promise.all([
        this.prisma.post.count({ where: wherePosts }),
        this.prisma.post.findMany({
          where: wherePosts,
          skip,
          take: pageSize,
          select: {
            id: true,
            title: true,
            category: true,
            type: true,
            isResolved: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                profile: { select: { name: true, profilePhotoUrl: true } },
              },
            },
          },
        }),
      ]);
    }

    if (searchEvents) {
      const whereEvents: any = {
        status: 'published',
      };

      if (cleanQ) {
        whereEvents.OR = [
          { title: { contains: cleanQ } },
          { description: { contains: cleanQ } },
        ];
      }

      [eventTotal, eventItems] = await Promise.all([
        this.prisma.event.count({ where: whereEvents }),
        this.prisma.event.findMany({
          where: whereEvents,
          skip,
          take: pageSize,
          select: {
            id: true,
            title: true,
            startAt: true,
            endAt: true,
            venueOrLink: true,
            capacity: true,
          },
        }),
      ]);
    }

    const totalResults = peopleTotal + postTotal + eventTotal;
    const isZeroResult = totalResults === 0;

    // Log query asynchronously to SearchLog (anonymized, no userId)
    if (cleanQ) {
      this.prisma.searchLog.create({
        data: {
          query: cleanQ,
          zeroResults: isZeroResult,
          resultCount: totalResults,
        },
      }).catch(() => {});
    }

    // Suggestions on zero result
    let suggestions: string[] = [];
    if (isZeroResult) {
      const popularTags = await this.prisma.expertiseTag.findMany({
        where: { status: 'active' },
        take: 5,
        select: { name: true },
      });
      suggestions = popularTags.map((t) => t.name);
    }

    return {
      people: {
        items: peopleItems,
        total: peopleTotal,
        counts: peopleTotal,
      },
      posts: {
        items: postItems,
        total: postTotal,
        counts: postTotal,
      },
      events: {
        items: eventItems,
        total: eventTotal,
        counts: eventTotal,
      },
      suggestions: isZeroResult ? suggestions : undefined,
    };
  }
}
