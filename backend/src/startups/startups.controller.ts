import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('startups')
export class StartupsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('suggest')
  async suggestStartups(@Query('name') name?: string) {
    if (!name || name.trim().length < 2) {
      return [];
    }

    const startups = await this.prisma.startup.findMany({
      where: {
        name: { contains: name.trim() },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        industry: true,
        stage: true,
        location: true,
        website: true,
      },
    });

    return startups;
  }
}
