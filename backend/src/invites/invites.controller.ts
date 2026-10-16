import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InvitesService } from './invites.service';
import { Public } from '../common/decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('invites')
export class InvitesController {
  private readonly isProd: boolean;

  constructor(
    private readonly invitesService: InvitesService,
    private readonly config: ConfigService,
  ) {
    this.isProd = this.config.get<string>('nodeEnv') === 'production';
  }

  @Public()
  @Get(':token')
  async validateInvite(@Param('token') token: string) {
    return this.invitesService.validateInvite(token);
  }

  @Public()
  @Post(':token/accept')
  async acceptInvite(
    @Param('token') token: string,
    @Body() body: { password?: string; name?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const { user, sessionToken } = await this.invitesService.acceptInvite(token, body, clientIp);

    res.cookie('oasis_sid', sessionToken, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    };
  }
}
