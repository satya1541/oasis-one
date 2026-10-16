import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberGuard } from '../common/guards/member.guard';

@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('restrictions')
  async getRestrictions(@CurrentUser('id') userId: string) {
    return this.usersService.getRestrictions(userId);
  }

  @Get('sessions')
  async getSessions(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ) {
    const currentSessionId = (req as any).session?.id || '';
    return this.usersService.getSessions(userId, currentSessionId);
  }

  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.usersService.revokeSession(userId, sessionId);
  }

  @Post('unlock-seen')
  async unlockSeen(@CurrentUser('id') userId: string) {
    return this.usersService.clearUnlockSeen(userId);
  }

  @UseGuards(MemberGuard)
  @Post('phone/otp')
  async sendPhoneOtp(@CurrentUser('id') userId: string) {
    return this.usersService.sendPhoneOtp(userId);
  }

  @UseGuards(MemberGuard)
  @Post('phone/verify')
  async verifyPhoneOtp(
    @CurrentUser('id') userId: string,
    @Body('code') code: string,
  ) {
    return this.usersService.verifyPhoneOtp(userId, code);
  }

  @UseGuards(MemberGuard)
  @Post('consents')
  async acceptConsents(
    @CurrentUser('id') userId: string,
    @Body('consents') consents: { type: any; version: string }[],
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.usersService.acceptConsents(userId, consents, clientIp);
  }

  @UseGuards(MemberGuard)
  @Post('data-export')
  async requestDataExport(@CurrentUser('id') userId: string) {
    return this.usersService.requestDataExport(userId);
  }

  @UseGuards(MemberGuard)
  @Get('data-export/:id')
  async getDataExport(
    @CurrentUser('id') userId: string,
    @Param('id') exportId: string,
  ) {
    return this.usersService.getDataExport(userId, exportId);
  }

  @UseGuards(MemberGuard)
  @Post('delete-account')
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.usersService.requestAccountDeletion(userId);
  }
}
