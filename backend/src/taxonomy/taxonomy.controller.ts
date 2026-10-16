import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { TagCategory } from '@prisma/client';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('tags')
  async getTags(@Query('category') category?: string) {
    const where: any = { status: 'active' };
    if (category && Object.values(TagCategory).includes(category as TagCategory)) {
      where.category = category as TagCategory;
    }

    return this.prisma.expertiseTag.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });
  }

  @Public()
  @Get('sectors')
  async getSectors() {
    return this.prisma.expertiseTag.findMany({
      where: { category: TagCategory.sector, status: 'active' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });
  }

  @Public()
  @Get('expertise')
  async getExpertise() {
    return this.prisma.expertiseTag.findMany({
      where: { category: TagCategory.expertise, status: 'active' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });
  }
}
