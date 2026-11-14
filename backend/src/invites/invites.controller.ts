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

    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const host = (req.headers['host'] as string) || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const domain = isLocalhost ? undefined : (process.env.COOKIE_DOMAIN || undefined);
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

    res.cookie('oasis_sid', sessionToken, {
      httpOnly: true,
      secure: isLocalhost ? false : (isHttps || this.isProd),
      sameSite: 'lax',
      path: '/',
      domain,
      maxAge: maxAgeMs,
      expires: new Date(Date.now() + maxAgeMs),
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
