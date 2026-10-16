import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { hashToken } from '../common/utils/crypto.util';
import * as argon2 from 'argon2';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class InvitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async validateInvite(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const invite = await this.prisma.inviteLink.findUnique({
      where: { tokenHash },
    });

    if (!invite || invite.expiresAt < new Date() || invite.status !== 'pending') {
      throw new HttpException(
        { code: 'NOT_FOUND', message: 'Invitation link is invalid or has expired' },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      email: invite.email,
      name: invite.name,
      preApprovedRole: invite.preApprovedRole,
      expiresAt: invite.expiresAt,
    };
  }

  async acceptInvite(rawToken: string, dto: { password?: string; name?: string }, ipAddress?: string) {
    const tokenHash = hashToken(rawToken);
    const invite = await this.prisma.inviteLink.findUnique({
      where: { tokenHash },
    });

    if (!invite || invite.expiresAt < new Date() || invite.status !== 'pending') {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Invitation link has expired or was already used' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // Check if user already exists
    let user = await this.prisma.user.findUnique({ where: { email: invite.email } });

    if (!user) {
      if (!dto.password) {
        throw new HttpException(
          { code: 'VALIDATION_FAILED', message: 'Password is required to claim your account' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const passwordHash = await argon2.hash(dto.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
      });

      user = await this.prisma.user.create({
        data: {
          email: invite.email,
          passwordHash,
          primaryRole: invite.preApprovedRole,
          accountStatus: AccountStatus.active, // Pre-approved members activate immediately without lock!
          emailVerified: true,
          profile: {
            create: {
              name: dto.name || invite.name || 'Member',
            },
          },
        },
      });
    } else {
      // Activate existing user
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          accountStatus: AccountStatus.active,
          primaryRole: invite.preApprovedRole,
          emailVerified: true,
        },
      });
    }

    // Mark invite as used
    await this.prisma.inviteLink.update({
      where: { id: invite.id },
      data: {
        status: 'used',
        usedAt: new Date(),
        registeredUserId: user.id,
      },
    });

    const { rawToken: sessionToken } = await this.authService.createSession(user.id, ipAddress, undefined, false);

    return { user, sessionToken };
  }
}
