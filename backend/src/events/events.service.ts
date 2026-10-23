import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import * as ics from 'ics';
import { EventStatus, EventVisibility, RegistrationStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async getEvents(params: {
    status?: string;
    page?: number;
    pageSize?: number;
    viewerId: string;
    viewerRole: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    const where: any = {
      status: params.status || EventStatus.published,
      OR: [
        { visibility: EventVisibility.all_members },
        {
          visibility: EventVisibility.specific_roles,
          visibleToRoles: { array_contains: params.viewerRole },
        },
        {
          visibility: EventVisibility.invite_only,
          invitees: { some: { userId: params.viewerId } },
        },
      ],
    };

    const [total, events] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startAt: 'asc' },
        include: {
          creator: { select: { id: true, profile: { select: { name: true } } } },
          _count: { select: { registrations: { where: { status: 'registered' } } } },
        },
      }),
    ]);

    const items = events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startAt: e.startAt,
      endAt: e.endAt,
      venueOrLink: e.venueOrLink,
      meetingLink: e.meetingLink,
      capacity: e.capacity,
      waitlistEnabled: e.waitlistEnabled,
      registrationDeadline: e.registrationDeadline,
      visibility: e.visibility,
      status: e.status,
      registeredCount: e._count.registrations,
    }));

    return { items, total, page, pageSize };
  }

  async getEventById(eventId: string, viewerId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        formFields: { orderBy: { displayOrder: 'asc' } },
        tags: { include: { tag: true } },
        registrations: { where: { userId: viewerId } },
        _count: { select: { registrations: { where: { status: 'registered' } } } },
      },
    });

    if (!event) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'Event not found' }, HttpStatus.NOT_FOUND);
    }

    const myReg = event.registrations[0];
    const isRegistered = myReg?.status === 'registered';

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      venueOrLink: event.venueOrLink,
      meetingLink: isRegistered ? event.meetingLink : undefined, // Only visible to registered members
      capacity: event.capacity,
      waitlistEnabled: event.waitlistEnabled,
      registrationDeadline: event.registrationDeadline,
      visibility: event.visibility,
      status: event.status,
      formFields: event.formFields,
      tags: event.tags.map((t) => t.tag.name),
      registeredCount: event._count.registrations,
      registration: myReg
        ? {
            id: myReg.id,
            status: myReg.status,
            waitlistPosition: myReg.waitlistPosition,
            registeredAt: myReg.registeredAt,
          }
        : null,
    };
  }

  async register(eventId: string, userId: string, responses?: Record<string, any>) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch event with locking check
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: { select: { registrations: { where: { status: 'registered' } } } },
        },
      });

      if (!event || event.status !== 'published') {
        throw new HttpException({ code: 'NOT_FOUND', message: 'Event is not available for registration' }, HttpStatus.NOT_FOUND);
      }

      if (event.registrationDeadline && event.registrationDeadline < new Date()) {
        throw new HttpException(
          { code: 'FORBIDDEN', message: 'Registration deadline has passed' },
          HttpStatus.FORBIDDEN,
        );
      }

      // Check existing registration
      const existing = await tx.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });

      if (existing && existing.status !== 'cancelled') {
        throw new HttpException(
          { code: 'CONFLICT', message: 'You are already registered or waitlisted for this event' },
          HttpStatus.CONFLICT,
        );
      }

      const currentRegistered = event._count.registrations;
      const hasCapacity = event.capacity ? currentRegistered < event.capacity : true;

      let regStatus: RegistrationStatus = RegistrationStatus.registered;
      let waitlistPos: number | null = null;

      if (!hasCapacity) {
        if (!event.waitlistEnabled) {
          throw new HttpException({ code: 'FORBIDDEN', message: 'This event has reached full capacity' }, HttpStatus.FORBIDDEN);
        }
        regStatus = RegistrationStatus.waitlisted;
        const currentWaitlistCount = await tx.eventRegistration.count({
          where: { eventId, status: 'waitlisted' },
        });
        waitlistPos = currentWaitlistCount + 1;
      }

      const registration = await tx.eventRegistration.upsert({
        where: { eventId_userId: { eventId, userId } },
        update: {
          status: regStatus,
          waitlistPosition: waitlistPos,
          responses: responses || undefined,
          cancelledAt: null,
          registeredAt: new Date(),
        },
        create: {
          eventId,
          userId,
          status: regStatus,
          waitlistPosition: waitlistPos,
          responses: responses || undefined,
        },
      });

      this.realtime.emit(`event:${eventId}`, 'event.updated', {
        eventId,
        change: regStatus === 'registered' ? 'capacity' : 'waitlist',
      });

      return registration;
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });

      if (!reg || reg.status === 'cancelled') {
        throw new HttpException({ code: 'NOT_FOUND', message: 'Registration not found' }, HttpStatus.NOT_FOUND);
      }

      const wasRegistered = reg.status === 'registered';

      await tx.eventRegistration.update({
        where: { id: reg.id },
        data: {
          status: RegistrationStatus.cancelled,
          cancelledAt: new Date(),
          waitlistPosition: null,
        },
      });

      // If registered member cancelled, promote next waitlisted member
      if (wasRegistered) {
        const nextInLine = await tx.eventRegistration.findFirst({
          where: { eventId, status: 'waitlisted' },
          orderBy: { waitlistPosition: 'asc' },
        });

        if (nextInLine) {
          await tx.eventRegistration.update({
            where: { id: nextInLine.id },
            data: {
              status: RegistrationStatus.registered,
              waitlistPosition: null,
            },
          });

          // Notify promoted member
          const notif = await tx.notification.create({
            data: {
              type: 'waitlist_promoted',
              title: 'Promoted from Event Waitlist!',
              body: 'A seat opened up and you have been registered for the event!',
              metadata: { eventId },
            },
          });

          await tx.notificationDelivery.create({
            data: {
              notificationId: notif.id,
              recipientId: nextInLine.userId,
            },
          });

          this.realtime.emitToUser(nextInLine.userId, 'event.updated', {
            eventId,
            change: 'waitlist_promoted',
          });
          this.realtime.emitToUser(nextInLine.userId, 'notification.new', {
            id: notif.id,
            type: 'waitlist_promoted',
          });
        }
      }

      this.realtime.emit(`event:${eventId}`, 'event.updated', {
        eventId,
        change: 'capacity',
      });

      return { ok: true, message: 'Registration cancelled' };
    });
  }

  async generateIcs(eventId: string, userId: string): Promise<string> {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new HttpException({ code: 'NOT_FOUND', message: 'Event not found' }, HttpStatus.NOT_FOUND);

    const start = new Date(event.startAt);
    const end = new Date(event.endAt);

    const icsEvent: ics.EventAttributes = {
      start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
      end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
      title: event.title,
      description: event.description,
      location: event.venueOrLink || 'Online',
      url: event.meetingLink || undefined,
      status: 'CONFIRMED',
      organizer: { name: 'OASIS', email: 'events@oasis.community' },
    };

    return new Promise((resolve, reject) => {
      ics.createEvent(icsEvent, (error, value) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
  }

  async getCalendar(userId: string, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const [eventRegistrations, tasks] = await Promise.all([
      this.prisma.eventRegistration.findMany({
        where: {
          userId,
          status: { in: ['registered', 'promoted'] },
          event: {
            startAt: { gte: fromDate, lte: toDate },
            status: { not: 'cancelled' },
          },
        },
        include: { event: true },
      }),
      this.prisma.task.findMany({
        where: {
          ownerId: userId,
          status: { in: ['open', 'completed'] },
          dueAt: { gte: fromDate, lte: toDate },
        },
      }),
    ]);

    const calendarItems = [
      ...eventRegistrations.map((r) => ({
        id: `event-${r.event.id}`,
        type: 'event',
        title: r.event.title,
        startAt: r.event.startAt,
        endAt: r.event.endAt,
        location: r.event.venueOrLink,
        meetingLink: r.event.meetingLink,
      })),
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        type: t.kind,
        title: t.title,
        dueAt: t.dueAt,
        priority: t.priority,
        status: t.status,
      })),
    ];

    calendarItems.sort((a: any, b: any) => {
      const timeA = new Date(a.startAt || a.dueAt).getTime();
      const timeB = new Date(b.startAt || b.dueAt).getTime();
      return timeA - timeB;
    });

    return calendarItems;
  }
}
