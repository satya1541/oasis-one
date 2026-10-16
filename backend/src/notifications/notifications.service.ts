import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [total, deliveries] = await Promise.all([
      this.prisma.notificationDelivery.count({ where: { recipientId: userId } }),
      this.prisma.notificationDelivery.findMany({
        where: { recipientId: userId },
        skip,
        take: pageSize,
        orderBy: { notification: { createdAt: 'desc' } },
        include: { notification: true },
      }),
    ]);

    const items = deliveries.map((d) => ({
      id: d.id,
      notificationId: d.notificationId,
      type: d.notification.type,
      title: d.notification.title,
      body: d.notification.body,
      metadata: d.notification.metadata,
      readAt: d.readAt,
      isRead: !!d.readAt,
      createdAt: d.notification.createdAt,
    }));

    return { items, total, page, pageSize };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notificationDelivery.count({
      where: { recipientId: userId, readAt: null },
    });
    return { unreadCount: count };
  }

  async markAsRead(deliveryId: string, userId: string) {
    const delivery = await this.prisma.notificationDelivery.findFirst({
      where: { id: deliveryId, recipientId: userId },
    });
    if (!delivery) throw new HttpException({ code: 'NOT_FOUND', message: 'Notification not found' }, HttpStatus.NOT_FOUND);

    await this.prisma.notificationDelivery.update({
      where: { id: deliveryId },
      data: { readAt: new Date() },
    });

    return { ok: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notificationDelivery.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findMany({
      where: { userId },
    });
  }

  async updatePreferences(userId: string, preferences: Array<{ notificationType: string; channelEmail: boolean; channelInApp: boolean }>) {
    for (const p of preferences) {
      const existing = await this.prisma.notificationPreference.findUnique({
        where: { userId_notificationType: { userId, notificationType: p.notificationType } },
      });

      // Essential preferences cannot be disabled
      if (existing?.isEssential) {
        p.channelEmail = true;
        p.channelInApp = true;
      }

      await this.prisma.notificationPreference.upsert({
        where: { userId_notificationType: { userId, notificationType: p.notificationType } },
        update: {
          channelEmail: p.channelEmail,
          channelInApp: p.channelInApp,
        },
        create: {
          userId,
          notificationType: p.notificationType,
          channelEmail: p.channelEmail,
          channelInApp: p.channelInApp,
        },
      });
    }

    return this.getPreferences(userId);
  }

  async savePushSubscription(userId: string, sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Invalid push subscription payload' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    await this.prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    });

    return { ok: true };
  }
}
