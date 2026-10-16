import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('events')
  async recordEvent(
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; props?: Record<string, any> },
  ) {
    if (body?.name) {
      // Fire and forget; do not block response
      this.prisma.analyticsEvent.create({
        data: {
          userId,
          name: body.name,
          props: body.props || undefined,
        },
      }).catch(() => {});
    }
    return { ok: true };
  }
}
