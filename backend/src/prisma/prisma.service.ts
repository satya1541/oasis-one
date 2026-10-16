import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    // Ensure database session operates strictly in UTC timezone
    await this.$executeRawUnsafe("SET time_zone = '+00:00'");
    this.logger.log('Prisma connected to MySQL (Session time_zone set to +00:00 UTC)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Prisma disconnected from MySQL');
  }
}
