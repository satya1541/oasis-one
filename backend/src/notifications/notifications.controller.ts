import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MemberGuard } from '../common/guards/member.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(MemberGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationsService.getNotifications(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post('notifications/:id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') deliveryId: string,
  ) {
    return this.notificationsService.markAsRead(deliveryId, userId);
  }

  @Post('notifications/read-all')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('me/notification-preferences')
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Put('me/notification-preferences')
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @Body('preferences') preferences: Array<{ notificationType: string; channelEmail: boolean; channelInApp: boolean }>,
  ) {
    return this.notificationsService.updatePreferences(userId, preferences || []);
  }

  @Post('me/push-subscription')
  async savePushSubscription(
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.notificationsService.savePushSubscription(userId, body);
  }
}
