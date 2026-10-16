import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  Query,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MemberGuard } from '../common/guards/member.guard';
import { generateRandomToken, hashToken } from '../common/utils/crypto.util';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LegalDocType, UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  private readonly isProd: boolean;
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.isProd = this.configService.get<string>('nodeEnv') === 'production';
    this.frontendUrl = this.configService.get<string>('frontendUrl') || 'http://localhost:7200';
  }

  private setSessionCookie(res: Response, token: string) {
    res.cookie('oasis_sid', token, {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearSessionCookie(res: Response) {
    res.clearCookie('oasis_sid', {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Public()
  @Get('csrf')
  getCsrf(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let csrfToken = req.cookies?.['oasis_csrf'];
    if (!csrfToken) {
      csrfToken = generateRandomToken(24);
      res.cookie('oasis_csrf', csrfToken, {
        httpOnly: false, // Accessible to frontend JS for double-submit header
        secure: this.isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return { csrfToken };
  }

  @Public()
  @Get('google')
  googleAuth(
    @Query('invite') invite: string | undefined,
    @Query('next') next: string | undefined,
    @Res() res: Response,
  ) {
    // Validate next is a relative path (prevent open redirect)
    let validatedNext = '/dashboard';
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')) {
      validatedNext = next;
    }

    const { authUrl, state, codeVerifier } = this.authService.getGoogleAuthUrl(invite, validatedNext);

    // Save PKCE verifier and state in temporary HttpOnly cookie (valid for 10 min)
    res.cookie('oasis_pkce', JSON.stringify({ state, codeVerifier, next: validatedNext }), {
      httpOnly: true,
      secure: this.isProd,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
      path: '/',
    });

    return res.redirect(302, authUrl);
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') returnedState: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!code) {
      return res.redirect(`${this.frontendUrl}/login?error=google_failed`);
    }

    const pkceCookie = req.cookies?.['oasis_pkce'];
    let nextPath = '/auth/callback';

    if (pkceCookie) {
      try {
        const parsed = JSON.parse(pkceCookie);
        if (parsed.next) {
          nextPath = `/auth/callback?next=${encodeURIComponent(parsed.next)}`;
        }
      } catch {}
      res.clearCookie('oasis_pkce', { path: '/' });
    }

    try {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
      const userAgent = req.headers['user-agent'];

      const { user, rawToken } = await this.authService.handleGoogleCallback(code, clientIp, userAgent);
      this.setSessionCookie(res, rawToken);

      return res.redirect(`${this.frontendUrl}${nextPath}`);
    } catch (err: any) {
      return res.redirect(`${this.frontendUrl}/login?error=${encodeURIComponent(err.message || 'google_failed')}`);
    }
  }

  @Public()
  @Post('register')
  async register(
    @Body() body: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const { user, rawToken } = await this.authService.register({
      ...body,
      ipAddress: clientIp,
    });

    this.setSessionCookie(res, rawToken);
    return {
      user: {
        id: user.id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    };
  }

  @Post('register/complete')
  async completeRegistration(
    @CurrentUser('id') userId: string,
    @Body() body: any,
    @Req() req: Request,
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    return this.authService.completeRegistration(userId, {
      ...body,
      ipAddress: clientIp,
    });
  }

  @Public()
  @Post('login')
  async login(
    @Body() body: { email?: string; password?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.email || !body?.password) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Email and password are required' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;
    const userAgent = req.headers['user-agent'];

    const { user, rawToken, requiresMfa } = await this.authService.login(
      body.email,
      body.password,
      clientIp,
      userAgent,
    );

    this.setSessionCookie(res, rawToken);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.name,
        primaryRole: user.primaryRole,
        adminLevel: user.adminLevel,
        accountStatus: user.accountStatus,
        requiresMfa,
      },
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionToken = req.cookies?.['oasis_sid'];
    if (sessionToken) {
      const tokenHash = hashToken(sessionToken);
      await this.authService.destroySession(tokenHash);
    }
    this.clearSessionCookie(res);
    return { message: 'Signed out successfully' };
  }

  @Get('me')
  async getMe(@CurrentUser() user: any, @Req() req: Request) {
    const session = (req as any).session;
    return this.authService.getMe({ ...user, session });
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    if (!token) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Token is required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    if (!email) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Email is required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.authService.resendVerification(email);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Email is required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token?: string; newPassword?: string }) {
    if (!body?.token || !body?.newPassword) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Token and new password are required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(MemberGuard)
  @Post('change-password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    if (!body?.currentPassword || !body?.newPassword) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Current and new password are required' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'Cannot change password on OAuth account without password' }, HttpStatus.FORBIDDEN);
    }
    const valid = await (require('argon2')).verify(user.passwordHash, body.currentPassword);
    if (!valid) {
      throw new HttpException({ code: 'VALIDATION_FAILED', message: 'Current password does not match' }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return this.authService.resetPassword(hashToken(user.email), body.newPassword);
  }

  @Post('mfa/setup')
  async setupMfa(@CurrentUser('id') userId: string) {
    return this.authService.setupMfa(userId);
  }

  @Post('mfa/verify')
  async verifyMfa(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
    @Body() body: { code?: string; backupCode?: string },
  ) {
    const session = (req as any).session;
    if (!session) {
      throw new HttpException({ code: 'UNAUTHENTICATED', message: 'Session required' }, HttpStatus.UNAUTHORIZED);
    }
    return this.authService.verifyMfa(userId, session.id, body?.code, body?.backupCode);
  }
}
