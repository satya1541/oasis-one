import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService,
  ) {}

  @Public()
  @Get()
  async getHealth() {
    let dbStatus = 'ok';
    let dbLatencyMs = 0;
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'error';
    }

    const workerHealthy = this.jobsService.isWorkerHealthy();

    return {
      status: dbStatus === 'ok' && workerHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          engine: 'MySQL 8',
        },
        jobsWorker: {
          status: workerHealthy ? 'ok' : 'stopped',
        },
      },
    };
  }
}
