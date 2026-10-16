import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('active')
  async getActive(@CurrentUser() user: any) {
    const now = new Date();
    const announcements = await this.prisma.announcement.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by targetRoles
    const userRole = user.primaryRole;
    return announcements.filter((a) => {
      const targetRoles = (a.targetRoles as string[]) || [];
      if (targetRoles.length === 0) return true;
      return targetRoles.includes(userRole);
    });
  }
}
