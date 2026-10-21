import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { AuditService } from '../audit/audit.service';
import { RealtimeService } from '../realtime/realtime.service';
import {
  hashToken,
  generateRandomToken,
  encryptField,
  decryptField,
} from '../common/utils/crypto.util';
import {
  UserRole,
  AccountStatus,
  ApplicationStatus,
  LegalDocType,
  VerificationTokenType,
} from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;
  private readonly fieldKey: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly realtimeService: RealtimeService,
  ) {
    this.fieldKey =
      this.configService.get<string>('auth.fieldEncryptionKey') ||
      '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';
    this.frontendUrl =
      this.configService.get<string>('frontendUrl') || 'https://oasisodisha.in';

    this.googleClient = new OAuth2Client(
      this.configService.get<string>('auth.google.clientId'),
      this.configService.get<string>('auth.google.clientSecret'),
      this.configService.get<string>('auth.google.callbackUrl'),
    );
  }

  // ----------------------------------------------------
  // SESSIONS
  // ----------------------------------------------------

  async createSession(userId: string, ipAddress?: string, userAgent?: string, mfaVerified = false) {
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours sliding

    const session = await this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        mfaVerified,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        lastActiveAt: now,
        expiresAt,
      },
    });

    return { session, rawToken };
  }

  async destroySession(tokenHash: string) {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
    });
    if (session) {
      await this.prisma.session.delete({ where: { id: session.id } });
      await this.realtimeService.revokeUserSessions(session.userId, 'signed_out');
    }
  }

  async destroyAllUserSessions(userId: string, reason = 'credentials_changed') {
    await this.prisma.session.deleteMany({ where: { userId } });
    await this.realtimeService.revokeUserSessions(userId, reason);
  }

  // ----------------------------------------------------
  // REGISTER & LOGIN (EMAIL / PASSWORD)
  // ----------------------------------------------------

  async register(rawDto: any) {
    const ageConfirmed = !!(rawDto.ageConfirmed ?? rawDto.ageConfirmation);
    if (!ageConfirmed) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'You must confirm that you are at least 18 years of age' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const name = String(rawDto.name || rawDto.fullName || 'Member');
    let primaryRole: UserRole = UserRole.aspiring_entrepreneur;
    if (rawDto.primaryRole && Object.values(UserRole).includes(rawDto.primaryRole)) {
      primaryRole = rawDto.primaryRole;
    } else if (rawDto.role) {
      if (rawDto.role === 'founder') primaryRole = UserRole.founder;
      else if (rawDto.role === 'mentor') primaryRole = UserRole.mentor;
      else primaryRole = UserRole.aspiring_entrepreneur;
    }

    let consents = rawDto.consents;
    if (!Array.isArray(consents) || consents.length === 0) {
      consents = [
        { type: LegalDocType.privacy_notice, version: rawDto.privacyNoticeVersion || '1.0' },
        { type: LegalDocType.community_guidelines, version: rawDto.communityGuidelinesVersion || '1.0' },
      ];
    }

    const dto = {
      ...rawDto,
      name,
      primaryRole,
      ageConfirmed,
      consents,
    };

    const email = (dto.email || '').toLowerCase().trim();

    // Check blacklist
    const emailHash = hashToken(email);
    const blacklisted = await this.prisma.blacklistIdentifier.findUnique({
      where: { identifierHash: emailHash },
    });
    if (blacklisted) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Registration not permitted for this identifier' },
        HttpStatus.FORBIDDEN,
      );
    }

    // Check existing email
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new HttpException(
        {
          code: 'CONFLICT',
          message: 'An account with this email address already exists. Please sign in instead.',
        },
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    // Check if matching invite exists
    const invite = await this.prisma.inviteLink.findFirst({
      where: { email, status: 'pending', expiresAt: { gt: new Date() } },
    });

    const isExpedited = !!invite;

    // Create User, Profile, Application, Consents in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          primaryRole: dto.primaryRole,
          accountStatus: AccountStatus.pending_verification,
          emailVerified: false,
          phone: dto.phone || null,
          timeZone: dto.timeZone || 'Asia/Kolkata',
        },
      });

      // Profile
      await tx.profile.create({
        data: {
          userId: user.id,
          name: dto.name,
          city: dto.city || null,
          state: dto.state || null,
          headline: dto.headline || null,
          bio: dto.bio || null,
          photoFileId: dto.photoFileId || null,
          linkedinUrl: dto.linkedin || dto.roleData?.linkedin || null,
          websiteUrl: dto.website || dto.roleData?.website || null,
          roleAttributes: dto.roleData || undefined,
          visibilitySettings: {
            email: 'private',
            phone: 'private',
            name: 'members',
            bio: 'members',
            linkedin: 'members',
          },
          contactPreferences: {
            shareEmailOnConnect: true,
            sharePhoneOnConnect: false,
          },
        },
      });

      // Application
      const application = await tx.application.create({
        data: {
          userId: user.id,
          submittedProfileSnapshot: {
            name: dto.name,
            role: dto.primaryRole,
            headline: dto.headline,
            bio: dto.bio,
            city: dto.city,
            state: dto.state,
            phone: dto.phone || null,
            roleData: dto.roleData,
            evidenceFileIds: dto.evidenceFileIds || [],
          },
          status: ApplicationStatus.pending,
          expedited: isExpedited,
        },
      });

      // Consent records
      if (dto.consents && dto.consents.length > 0) {
        for (const c of dto.consents) {
          await tx.consentRecord.create({
            data: {
              userId: user.id,
              documentType: c.type,
              documentVersion: c.version,
              ipAddress: dto.ipAddress || null,
            },
          });
        }
      }

      // Default Notification Preferences
      const defaultTypes = [
        { type: 'account_status', essential: true },
        { type: 'application_update', essential: true },
        { type: 'event_reminder', essential: false },
        { type: 'connection_request', essential: false },
        { type: 'post_reply', essential: false },
        { type: 'achievement_published', essential: false },
        { type: 'weekly_digest', essential: false, email: false },
      ];

      for (const pref of defaultTypes) {
        await tx.notificationPreference.create({
          data: {
            userId: user.id,
            notificationType: pref.type,
            channelEmail: pref.email !== undefined ? pref.email : true,
            channelInApp: true,
            isEssential: pref.essential,
          },
        });
      }

      return { user, application };
    });

    // Generate Email Verification Token
    const rawVerifyToken = generateRandomToken(32);
    const tokenHash = hashToken(rawVerifyToken);
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.verificationToken.create({
      data: {
        userId: result.user.id,
        email,
        tokenHash,
        type: VerificationTokenType.email_verify,
        expiresAt: verifyExpires,
      },
    });

    // Send verification email
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${rawVerifyToken}`;
    this.mailService.sendMail({
      to: email,
      subject: 'Verify your email address for OASIS ONE',
      headline: 'Welcome to OASIS ONE',
      body: `Thank you for starting your registration. Please verify your email address to submit your membership application for admin review.`,
      actionText: 'Verify Email Address',
      actionUrl: verifyUrl,
    });

    // Create session (locked until approved)
    const { rawToken } = await this.createSession(result.user.id, dto.ipAddress, undefined, false);

    await this.auditService.log({
      actorId: result.user.id,
      action: 'auth.registered',
      targetType: 'user',
      targetId: result.user.id,
      ipAddress: dto.ipAddress,
      metadata: { role: dto.primaryRole, expedited: isExpedited },
    });

    return { user: result.user, rawToken };
  }

  async login(emailInput: string, passwordInput: string, ipAddress?: string, userAgent?: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        applications: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!user || !user.passwordHash) {
      throw new HttpException(
        { code: 'UNAUTHENTICATED', message: 'Invalid email address or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const valid = await argon2.verify(user.passwordHash, passwordInput);
    if (!valid) {
      throw new HttpException(
        { code: 'UNAUTHENTICATED', message: 'Invalid email address or password' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check account status
    if (user.accountStatus === AccountStatus.blacklisted) {
      throw new HttpException(
        { code: 'ACCOUNT_STATE', message: 'Account has been permanently blacklisted', details: { status: user.accountStatus } },
        HttpStatus.FORBIDDEN,
      );
    }
    if (user.accountStatus === AccountStatus.revoked) {
      throw new HttpException(
        { code: 'ACCOUNT_STATE', message: 'Membership has been revoked', details: { status: user.accountStatus } },
        HttpStatus.FORBIDDEN,
      );
    }

    // Admins require MFA before session is mfaVerified
    const isMfaAdmin = !!user.adminLevel;
    const mfaVerified = !isMfaAdmin; // regular users don't have mandatory MFA

    const { rawToken } = await this.createSession(user.id, ipAddress, userAgent, mfaVerified);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.log({
      actorId: user.id,
      action: 'auth.login',
      targetType: 'user',
      targetId: user.id,
      ipAddress,
    });

    return { user, rawToken, requiresMfa: isMfaAdmin };
  }

  // ----------------------------------------------------
  // GOOGLE OAUTH FLOW (PKCE)
  // ----------------------------------------------------

  getGoogleAuthUrl(invite?: string, next?: string, mode: string = 'login', role?: string) {
    const state = generateRandomToken(16);
    const codeVerifier = generateRandomToken(32);
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const callbackUrl =
      this.configService.get<string>('auth.google.callbackUrl') ||
      'https://back.oasisodisha.in/api/v1/auth/google/callback';

    const authUrl = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state: JSON.stringify({ state, invite, next, verifier: codeVerifier, mode, role }),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256' as any,
      redirect_uri: callbackUrl,
    });

    return { authUrl, state, codeVerifier };
  }

  async handleGoogleCallback(
    code: string,
    ipAddress?: string,
    userAgent?: string,
    codeVerifier?: string,
    mode: string = 'login',
    role?: string,
  ) {
    const callbackUrl =
      this.configService.get<string>('auth.google.callbackUrl') ||
      'https://back.oasisodisha.in/api/v1/auth/google/callback';

    const tokenOptions: any = {
      code,
      redirect_uri: callbackUrl,
    };
    if (codeVerifier) {
      tokenOptions.codeVerifier = codeVerifier;
    }

    const { tokens } = await this.googleClient.getToken(tokenOptions);
    if (!tokens.id_token) {
      throw new HttpException(
        { code: 'UNAUTHENTICATED', message: 'Google ID token missing from response' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.configService.get<string>('auth.google.clientId'),
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.email_verified) {
      throw new HttpException(
        { code: 'UNAUTHENTICATED', message: 'Verified Google email is required' },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const email = payload.email.toLowerCase().trim();
    const googleSub = payload.sub;
    const name = payload.name || 'Member';
    const picture = payload.picture || null;

    // Check blacklist
    const emailHash = hashToken(email);
    const blacklisted = await this.prisma.blacklistIdentifier.findUnique({
      where: { identifierHash: emailHash },
    });
    if (blacklisted) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Account is blacklisted' },
        HttpStatus.FORBIDDEN,
      );
    }

    // 1. Check existing AuthIdentity (without eager relation inclusion to prevent Prisma crash if user was manually deleted from DB)
    const identity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'google',
          providerUserId: googleSub,
        },
      },
    });

    let user: any = null;
    if (identity) {
      user = await this.prisma.user.findUnique({
        where: { id: identity.userId },
        include: { profile: true },
      });
      if (!user) {
        // Self-heal: Orphaned AuthIdentity found (user was deleted manually from DB)
        await this.prisma.authIdentity.deleteMany({
          where: { provider: 'google', providerUserId: googleSub },
        }).catch(() => {});
      }
    }

    // 2. If not found by identity, check user by verified email
    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });
      if (existingUser) {
        // Remove any stale identity first (idempotent)
        await this.prisma.authIdentity.deleteMany({
          where: { provider: 'google', providerUserId: googleSub },
        }).catch(() => {});
        // Link identity to existing user
        await this.prisma.authIdentity.create({
          data: {
            userId: existingUser.id,
            provider: 'google',
            providerUserId: googleSub,
          },
        });
        user = existingUser;
      }
    }

    // 3. User does not exist in the database
    if (!user) {
      if (mode === 'login') {
        // User attempted login, but is NOT registered yet.
        // Route to /join to complete role, documents, and submit for approval.
        return {
          notRegistered: true,
          email,
          name,
          picture,
        };
      }

      // If mode === 'signup' (initiated from /join/account):
      user = await this.prisma.$transaction(async (tx) => {
        // Ensure no stale identity exists before creating
        await tx.authIdentity.deleteMany({
          where: { provider: 'google', providerUserId: googleSub },
        }).catch(() => {});

        const newUser = await tx.user.create({
          data: {
            email,
            emailVerified: true,
            accountStatus: AccountStatus.pending_verification,
            primaryRole: (role as any) || null,
          },
        });

        await tx.authIdentity.create({
          data: {
            userId: newUser.id,
            provider: 'google',
            providerUserId: googleSub,
          },
        });

        const profile = await tx.profile.create({
          data: {
            userId: newUser.id,
            name,
            profilePhotoUrl: picture,
            visibilitySettings: {
              email: 'private',
              phone: 'private',
              name: 'members',
              bio: 'members',
            },
          },
        });

        return { ...newUser, profile };
      });
    }

    if (!user) {
      throw new HttpException(
        { code: 'INTERNAL_ERROR', message: 'Failed to authenticate user' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Check account status restrictions
    if (user.accountStatus === AccountStatus.blacklisted) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Account has been permanently blacklisted' },
        HttpStatus.FORBIDDEN,
      );
    }
    if (user.accountStatus === AccountStatus.revoked) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Membership has been revoked' },
        HttpStatus.FORBIDDEN,
      );
    }

    const isMfaAdmin = !!user.adminLevel;
    const { rawToken } = await this.createSession(user.id, ipAddress, userAgent, !isMfaAdmin);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.auditService.log({
      actorId: user.id,
      action: 'auth.google_login',
      targetType: 'user',
      targetId: user.id,
      ipAddress,
      metadata: { email, mode },
    });

    return { user, rawToken, requiresMfa: isMfaAdmin };
  }

  // ----------------------------------------------------
  // COMPLETE REGISTRATION (GOOGLE SIGN-UP)
  // ----------------------------------------------------

  async completeRegistration(
    userId: string,
    dto: {
      primaryRole: UserRole;
      timeZone?: string;
      city?: string;
      state?: string;
      headline?: string;
      bio?: string;
      roleData?: Record<string, any>;
      ageConfirmed: boolean;
      consents: { type: LegalDocType; version: string }[];
      ipAddress?: string;
    },
  ) {
    if (!dto.ageConfirmed) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'You must confirm that you are at least 18 years of age' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          primaryRole: dto.primaryRole,
          phone: (dto as any).phone || undefined,
          accountStatus: AccountStatus.pending_approval,
          timeZone: dto.timeZone || 'Asia/Kolkata',
        },
      });

      await tx.profile.upsert({
        where: { userId },
        update: {
          city: dto.city,
          state: dto.state,
          headline: dto.headline,
          bio: dto.bio,
          linkedinUrl: (dto as any).linkedin || dto.roleData?.linkedin || undefined,
          websiteUrl: (dto as any).website || dto.roleData?.website || undefined,
          roleAttributes: dto.roleData,
        },
        create: {
          userId,
          name: 'Member',
          city: dto.city,
          state: dto.state,
          headline: dto.headline,
          bio: dto.bio,
          linkedinUrl: (dto as any).linkedin || dto.roleData?.linkedin || undefined,
          websiteUrl: (dto as any).website || dto.roleData?.website || undefined,
          roleAttributes: dto.roleData,
        },
      });

      await tx.application.create({
        data: {
          userId,
          submittedProfileSnapshot: {
            role: dto.primaryRole,
            headline: dto.headline,
            bio: dto.bio,
            city: dto.city,
            state: dto.state,
            phone: (dto as any).phone,
            roleData: dto.roleData,
            evidenceFileIds: (dto as any).evidenceFileIds || [],
          },
          status: ApplicationStatus.pending,
        },
      });

      if (dto.consents) {
        for (const c of dto.consents) {
          await tx.consentRecord.create({
            data: {
              userId,
              documentType: c.type,
              documentVersion: c.version,
              ipAddress: dto.ipAddress || null,
            },
          });
        }
      }
    });

    return { ok: true };
  }

  // ----------------------------------------------------
  // VERIFICATIONS & PASSWORD RESET
  // ----------------------------------------------------

  async verifyEmail(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (!token || token.expiresAt < new Date() || token.usedAt) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Verification link has expired or is invalid' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: token.userId! },
        data: {
          emailVerified: true,
          accountStatus: AccountStatus.pending_approval,
        },
      }),
    ]);

    return { ok: true, message: 'Email successfully verified' };
  }

  async resendVerification(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Always return generic success to prevent email enumeration
    if (user && !user.emailVerified) {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          type: VerificationTokenType.email_verify,
          expiresAt,
        },
      });

      const verifyUrl = `${this.frontendUrl}/verify-email?token=${rawToken}`;
      this.mailService.sendMail({
        to: email,
        subject: 'Verify your email address for OASIS ONE',
        body: 'Click below to verify your email address and submit your application for review.',
        actionText: 'Verify Email',
        actionUrl: verifyUrl,
      });
    }

    return { message: 'If an unverified account exists for this email, a verification link has been sent.' };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && user.passwordHash) {
      const rawToken = generateRandomToken(32);
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.prisma.verificationToken.create({
        data: {
          userId: user.id,
          email,
          tokenHash,
          type: VerificationTokenType.password_reset,
          expiresAt,
        },
      });

      const resetUrl = `${this.frontendUrl}/reset-password?token=${rawToken}`;
      this.mailService.sendMail({
        to: email,
        subject: 'Reset your password for OASIS ONE',
        headline: 'Password Reset Request',
        body: 'We received a request to reset your OASIS ONE password. This link is valid for 1 hour.',
        actionText: 'Reset Password',
        actionUrl: resetUrl,
      });
    }

    return { message: 'If an account exists with this email, instructions have been sent.' };
  }

  async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = hashToken(rawToken);
    const token = await this.prisma.verificationToken.findUnique({
      where: { tokenHash },
    });

    if (!token || token.expiresAt < new Date() || token.usedAt) {
      throw new HttpException(
        { code: 'VALIDATION_FAILED', message: 'Reset token is invalid or has expired' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });

    await this.prisma.$transaction([
      this.prisma.verificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: token.userId! },
        data: { passwordHash },
      }),
    ]);

    await this.destroyAllUserSessions(token.userId!, 'password_reset');

    return { message: 'Password has been successfully updated' };
  }

  // ----------------------------------------------------
  // MFA (ADMIN TOTP)
  // ----------------------------------------------------

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.adminLevel) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'MFA setup is for administrators' }, HttpStatus.FORBIDDEN);
    }

    const secret = authenticator.generateSecret();
    const encryptedSecret = encryptField(secret, this.fieldKey);
    const otpauthUrl = authenticator.keyuri(user.email, 'OASIS ONE Admin', secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate 8 backup codes
    const rawBackupCodes = Array.from({ length: 8 }, () => generateRandomToken(4).toUpperCase());
    const hashedBackupCodes = rawBackupCodes.map((code) => hashToken(code));

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: encryptedSecret,
        mfaBackupCodes: hashedBackupCodes,
      },
    });

    return {
      secret,
      otpauthUrl,
      qrCode: qrCodeDataUrl,
      backupCodes: rawBackupCodes,
    };
  }

  async verifyMfa(userId: string, sessionId: string, code?: string, backupCode?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new HttpException({ code: 'FORBIDDEN', message: 'MFA is not configured' }, HttpStatus.FORBIDDEN);
    }

    let isValid = false;

    if (code) {
      const secret = decryptField(user.mfaSecret, this.fieldKey);
      isValid = authenticator.verify({ token: code, secret });
    } else if (backupCode) {
      const inputHash = hashToken(backupCode.trim().toUpperCase());
      const backupCodes = (user.mfaBackupCodes as string[]) || [];
      const index = backupCodes.indexOf(inputHash);
      if (index !== -1) {
        isValid = true;
        // Invalidate used backup code
        backupCodes.splice(index, 1);
        await this.prisma.user.update({
          where: { id: userId },
          data: { mfaBackupCodes: backupCodes },
        });
      }
    }

    if (!isValid) {
      throw new HttpException(
        { code: 'FORBIDDEN', message: 'Invalid authentication code or backup code' },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: sessionId },
        data: { mfaVerified: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { mfaEnabled: true },
      }),
    ]);

    return { ok: true, message: 'MFA verification successful' };
  }

  // ----------------------------------------------------
  // GET /auth/me
  // ----------------------------------------------------

  async getMe(user: any) {
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        applications: { orderBy: { createdAt: 'desc' }, take: 1 },
        consentRecords: true,
      },
    });

    if (!fullUser) {
      throw new HttpException({ code: 'NOT_FOUND', message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    const application = fullUser.applications?.[0];
    const appStatus: ApplicationStatus = application ? application.status : ApplicationStatus.not_started;

    // Check current legal docs vs user's consents
    const currentLegalDocs = await this.prisma.legalDocument.findMany({
      where: { isCurrent: true },
    });
    const pendingConsents = currentLegalDocs
      .filter((doc) => !fullUser.consentRecords.some((cr) => cr.documentType === doc.type && cr.documentVersion === doc.version))
      .map((doc) => ({ type: doc.type, version: doc.version }));

    return {
      id: fullUser.id,
      email: fullUser.email,
      emailVerified: fullUser.emailVerified,
      name: fullUser.profile?.name || 'Member',
      avatarUrl: fullUser.profile?.profilePhotoUrl || null,
      primaryRole: fullUser.primaryRole,
      accountStatus: fullUser.accountStatus,
      applicationStatus: appStatus,
      adminLevel: fullUser.adminLevel,
      mfaVerified: user.session?.mfaVerified || false,
      timeZone: fullUser.timeZone,
      pendingConsents,
      showUnlockAnimation: fullUser.accountStatus === 'active' && fullUser.unlockAnimationPending,
    };
  }
}
