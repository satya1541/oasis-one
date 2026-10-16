import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { LegalDocType } from '@prisma/client';

@Controller()
export class LegalController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('legal/current')
  async getAllCurrentLegalDocs() {
    const docs = await this.prisma.legalDocument.findMany({
      where: { isCurrent: true },
    });
    const map: Record<string, any> = {};
    for (const doc of docs) {
      map[doc.type] = {
        type: doc.type,
        version: doc.version,
        title: doc.title,
        body: doc.body,
        publishedAt: doc.publishedAt,
      };
    }
    return map;
  }

  @Public()
  @Get('legal/:type/current')
  async getCurrentLegalDoc(@Param('type') typeStr: string) {
    if (!Object.values(LegalDocType).includes(typeStr as LegalDocType)) {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Document type not recognized' },
        HttpStatus.NOT_FOUND,
      );
    }

    const doc = await this.prisma.legalDocument.findFirst({
      where: {
        type: typeStr as LegalDocType,
        isCurrent: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    if (!doc) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'No active document published' }, HttpStatus.NOT_FOUND);
    }

    return {
      type: doc.type,
      version: doc.version,
      title: doc.title,
      body: doc.body,
      publishedAt: doc.publishedAt,
    };
  }

  @Public()
  @Get('config/public')
  async getPublicConfig() {
    const settings = await this.prisma.setting.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const legalDocs = await this.prisma.legalDocument.findMany({
      where: { isCurrent: true },
    });

    return {
      supportEmail: settingsMap.get('support_email') || 'support@oasis.community',
      minAge: parseInt(settingsMap.get('min_age') || '18', 10),
      coolingOffDays: parseInt(settingsMap.get('cooling_off_days') || '30', 10),
      legalVersions: legalDocs.map((d) => ({
        type: d.type,
        version: d.version,
        title: d.title,
      })),
    };
  }
}
