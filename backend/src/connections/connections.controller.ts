import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberGuard } from '../common/guards/member.guard';

@UseGuards(MemberGuard)
@Controller()
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get('mentors')
  async getMentors(
    @Query('expertise') expertise?: string,
    @Query('sector') sector?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @CurrentUser('id') viewerId?: string,
  ) {
    return this.connectionsService.getMentors({
      expertise,
      sector,
      location,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
      viewerId: viewerId!,
    });
  }

  @Post('connections')
  async sendRequest(
    @CurrentUser('id') senderId: string,
    @Body() body: { recipientId: string; message?: string },
  ) {
    return this.connectionsService.sendRequest(senderId, body.recipientId, body.message);
  }

  @Get('connections')
  async getConnections(
    @CurrentUser('id') userId: string,
    @Query('box') box = 'active',
  ) {
    return this.connectionsService.getConnections(userId, box);
  }

  @Post('connections/:id/accept')
  async acceptConnection(
    @Param('id') connectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.respond(connectionId, userId, 'accept');
  }

  @Post('connections/:id/decline')
  async declineConnection(
    @Param('id') connectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.respond(connectionId, userId, 'decline');
  }

  @Post('connections/:id/cancel')
  async cancelConnection(
    @Param('id') connectionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.connectionsService.respond(connectionId, userId, 'cancel');
  }

  @Get('blocks')
  async getBlocks(@CurrentUser('id') userId: string) {
    return this.connectionsService.getBlocks(userId);
  }

  @Post('blocks')
  async blockUser(
    @CurrentUser('id') userId: string,
    @Body('userId') targetUserId: string,
  ) {
    return this.connectionsService.blockUser(userId, targetUserId);
  }

  @Delete('blocks/:userId')
  async unblockUser(
    @CurrentUser('id') userId: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.connectionsService.unblockUser(userId, targetUserId);
  }
}
