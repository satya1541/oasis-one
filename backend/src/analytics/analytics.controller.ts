import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Post('events')
  async recordEvent(
    @CurrentUser('id') userId: string | undefined,
    @Req() req: Request,
    @Body() body: { name?: string; props?: Record<string, any> },
  ) {
    // Only record authenticated user sessions; silently ignore unauthenticated page hits
    if (!userId || !body?.name || typeof body.name !== 'string') {
      return { ok: true, tracked: false };
    }

    const eventName = body.name.trim().slice(0, 100);
    const incomingProps =
      body.props && typeof body.props === 'object' && !Array.isArray(body.props)
        ? body.props
        : {};

    if (eventName === 'route_visit') {
      const user = (req as any).user;
      const appStatus = user?.applications?.[0]?.status || 'not_started';
      const visitId =
        typeof incomingProps.visitId === 'string' && UUID_RE.test(incomingProps.visitId)
          ? incomingProps.visitId
          : undefined;

      const sanitizedProps: Record<string, any> = {
        path: typeof incomingProps.path === 'string' ? incomingProps.path.slice(0, 255) : '/',
        fullPath:
          typeof incomingProps.fullPath === 'string'
            ? incomingProps.fullPath.slice(0, 500)
            : typeof incomingProps.path === 'string'
              ? incomingProps.path.slice(0, 500)
              : '/',
        fromPath:
          typeof incomingProps.fromPath === 'string'
            ? incomingProps.fromPath.slice(0, 500)
            : null,
        phase: typeof incomingProps.phase === 'string' ? incomingProps.phase.slice(0, 30) : 'enter',
        trigger:
          typeof incomingProps.trigger === 'string' ? incomingProps.trigger.slice(0, 30) : 'enter',
        enteredAt:
          typeof incomingProps.enteredAt === 'string'
            ? incomingProps.enteredAt
            : new Date().toISOString(),
        leftAt: typeof incomingProps.leftAt === 'string' ? incomingProps.leftAt : null,
        durationMs:
          typeof incomingProps.durationMs === 'number' && Number.isFinite(incomingProps.durationMs)
            ? Math.max(0, Math.round(incomingProps.durationMs))
            : null,
        accountStatus: user?.accountStatus || null,
        applicationStatus: appStatus,
      };

      this.upsertRouteVisit(visitId, userId, sanitizedProps).catch(() => {});
      return { ok: true, tracked: true };
    }

    // Fire and forget; do not block response
    this.prisma.analyticsEvent
      .create({
        data: {
          userId,
          name: eventName,
          props: Object.keys(incomingProps).length > 0 ? incomingProps : undefined,
        },
      })
      .catch(() => {});

    return { ok: true, tracked: true };
  }

  private async upsertRouteVisit(
    visitId: string | undefined,
    userId: string,
    incoming: Record<string, any>,
  ): Promise<void> {
    if (!visitId) {
      await this.prisma.analyticsEvent.create({
        data: {
          userId,
          name: 'route_visit',
          props: incoming,
        },
      });
      return;
    }

    const existing = await this.prisma.analyticsEvent.findUnique({
      where: { id: visitId },
      select: { id: true, userId: true, props: true },
    });

    if (!existing) {
      await this.prisma.analyticsEvent.create({
        data: {
          id: visitId,
          userId,
          name: 'route_visit',
          props: incoming,
        },
      });
      return;
    }

    if (existing.userId !== userId) {
      return;
    }

    const prev =
      existing.props && typeof existing.props === 'object' && !Array.isArray(existing.props)
        ? (existing.props as Record<string, any>)
        : {};

    // Preserve finalized leave data if an earlier enter packet arrives out of order
    const hasFinalLeave = Boolean(prev.leftAt);
    const merged: Record<string, any> = {
      ...prev,
      ...incoming,
      enteredAt: prev.enteredAt || incoming.enteredAt,
      fromPath: prev.fromPath ?? incoming.fromPath,
      leftAt: incoming.leftAt || prev.leftAt || null,
      phase: hasFinalLeave && incoming.phase !== 'leave' ? prev.phase : incoming.phase,
    };

    const enteredMs = Date.parse(merged.enteredAt);
    const leftMs = merged.leftAt ? Date.parse(merged.leftAt) : NaN;
    if (!Number.isNaN(enteredMs) && !Number.isNaN(leftMs) && leftMs >= enteredMs) {
      merged.durationMs = Math.round(leftMs - enteredMs);
    } else if (typeof prev.durationMs === 'number' && typeof incoming.durationMs === 'number') {
      merged.durationMs = Math.max(prev.durationMs, incoming.durationMs);
    }

    await this.prisma.analyticsEvent.update({
      where: { id: visitId },
      data: { props: merged },
    });
  }
}
