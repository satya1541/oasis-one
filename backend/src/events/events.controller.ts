import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('events')
  async getEvents(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser('id') viewerId?: string,
    @CurrentUser('primaryRole') viewerRole?: string,
  ) {
    return this.eventsService.getEvents({
      status,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      viewerId: viewerId || '',
      viewerRole: viewerRole || 'none',
    });
  }

  @Get('events/:id')
  async getEvent(
    @Param('id') eventId: string,
    @CurrentUser('id') viewerId: string,
  ) {
    return this.eventsService.getEventById(eventId, viewerId);
  }

  @Post('events/:id/register')
  async register(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Body('responses') responses?: Record<string, any>,
  ) {
    return this.eventsService.register(eventId, userId, responses);
  }

  @Delete('events/:id/register')
  async cancelRegistration(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.cancelRegistration(eventId, userId);
  }

  @Get('events/:id/ics')
  async getIcs(
    @Param('id') eventId: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const icsContent = await this.eventsService.generateIcs(eventId, userId);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}.ics"`);
    return res.send(icsContent);
  }

  @Get('me/calendar')
  async getCalendar(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.eventsService.getCalendar(userId, from, to);
  }
}
