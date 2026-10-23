import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('applications/me')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  async getMyApplication(@CurrentUser('id') userId: string) {
    return this.applicationsService.getMyApplication(userId);
  }

  @Patch()
  async updateMyApplication(
    @CurrentUser('id') userId: string,
    @Body() body: Record<string, any>,
  ) {
    return this.applicationsService.updateMyApplication(userId, body);
  }

  @Get('messages')
  async getMyMessages(@CurrentUser('id') userId: string) {
    return this.applicationsService.getMyMessages(userId);
  }

  @Post('messages')
  async sendMyMessage(
    @CurrentUser('id') userId: string,
    @Body() body: { body?: string; attachments?: any },
  ) {
    return this.applicationsService.sendMyMessage(userId, body?.body || '', body?.attachments);
  }

  @Post('documents')
  async uploadMyDocument(
    @CurrentUser('id') userId: string,
    @Body('fileId') fileId: string,
  ) {
    return this.applicationsService.attachDocument(userId, fileId);
  }

  @Post('withdraw')
  async withdrawMyApplication(@CurrentUser('id') userId: string) {
    return this.applicationsService.withdrawMyApplication(userId);
  }

  @Post('reapply')
  async reapply(@CurrentUser('id') userId: string) {
    return this.applicationsService.reapply(userId);
  }
}
