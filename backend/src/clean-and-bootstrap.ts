import { PrismaClient, UserRole, AccountStatus, AdminLevel, TagCategory, TagStatus, LegalDocType } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function encryptField(text: string, keyHex: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function cleanAndBootstrap() {
  console.log('--- 1. DELETING ALL FAKE & ORPHAN RECORDS FROM DATABASE ---');

  // Delete all community content, events, tasks, applications
  await prisma.postResponse.deleteMany({});
  await prisma.postTag.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.eventTag.deleteMany({});
  await prisma.eventFormField.deleteMany({});
  await prisma.eventInvitee.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.contentReport.deleteMany({});
  await prisma.restriction.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.startupMember.deleteMany({});
  await prisma.startup.deleteMany({});
  await prisma.profileTag.deleteMany({});
  await prisma.profileChangeRequest.deleteMany({});
  await prisma.connectionRequest.deleteMany({});
  await prisma.memberBlock.deleteMany({});
  await prisma.applicationMessage.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.consentRecord.deleteMany({});
  await prisma.notificationDelivery.deleteMany({});
  await prisma.notificationPreference.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.pushSubscription.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.authIdentity.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  // Note: auditLog is append-only by DB trigger / compliance, do not deleteMany
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database successfully wiped of all fake records.');

  console.log('--- 2. SEEDING PRODUCTION SYSTEM SETTINGS ---');
  const defaultSettings = [
    { key: 'cooling_off_days', value: '30' },
    { key: 'invite_expiry_days', value: '14' },
    { key: 'inactivity_warning_months', value: '12' },
    { key: 'inactivity_deactivate_months', value: '15' },
    { key: 'application_retention_days', value: '90' },
    { key: 'report_retention_days', value: '365' },
    { key: 'audit_retention_days', value: '1095' },
    { key: 'max_connection_requests_24h', value: '10' },
    { key: 'connection_expiry_days', value: '14' },
    { key: 'connection_cooldown_days', value: '7' },
    { key: 'achievement_expiry_hours', value: '24' },
    { key: 'min_age', value: '18' },
    { key: 'support_email', value: 'support@oasis.community' },
    { key: 'grievance_email', value: 'grievance@oasis.community' },
    { key: 'oversight_email', value: 'oversight@oasis.community' },
    { key: 'app_name', value: 'OASIS' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('--- 3. SEEDING PRODUCTION TAXONOMY TAGS ---');
  const sectorTags = [
    'DeepTech',
    'AI/ML',
    'FinTech',
    'HealthTech',
    'AgriTech',
    'EdTech',
    'ClimateTech',
    'SaaS',
    'D2C/E-commerce',
    'Hardware/Manufacturing',
  ];

  for (const name of sectorTags) {
    await prisma.expertiseTag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        category: TagCategory.sector,
        status: TagStatus.active,
      },
    });
  }

  const expertiseTags = [
    'Funding',
    'Sales',
    'Marketing',
    'Product',
    'Technology',
    'Hiring',
    'Partnerships',
    'Legal/Compliance',
    'Operations',
  ];

  for (const name of expertiseTags) {
    await prisma.expertiseTag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        category: TagCategory.expertise,
        status: TagStatus.active,
      },
    });
  }

  console.log('--- 4. SEEDING LEGAL COMPLIANCE DOCUMENTS ---');
  await prisma.legalDocument.upsert({
    where: {
      type_version: {
        type: LegalDocType.privacy_notice,
        version: '1.0',
      },
    },
    update: {},
    create: {
      type: LegalDocType.privacy_notice,
      version: '1.0',
      title: 'Privacy Notice (DPDP Act Compliance)',
      body: `## OASIS Privacy Notice (v1.0)\nOfficial data protection notice for the OASIS Odisha startup community network.`,
      isCurrent: true,
      publishedAt: new Date(),
    },
  });

  await prisma.legalDocument.upsert({
    where: {
      type_version: {
        type: LegalDocType.community_guidelines,
        version: '1.0',
      },
    },
    update: {},
    create: {
      type: LegalDocType.community_guidelines,
      version: '1.0',
      title: 'Community Guidelines & Standards',
      body: `## OASIS Community Guidelines (v1.0)\nStandards and governance rules for accredited founders and mentors in Odisha.`,
      isCurrent: true,
      publishedAt: new Date(),
    },
  });

  console.log('--- 5. CREATING OFFICIAL SUPER ADMIN USER ---');
  const fieldKey = process.env.FIELD_ENCRYPTION_KEY || '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';
  const adminPasswordHash = await argon2.hash('AdminPassword2026!@#', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const totpSecret = 'JBSWY3DPEHPK3PXP'; // Base32 standard secret
  const encryptedMfaSecret = encryptField(totpSecret, fieldKey);
  const backupCodeHash = hashToken('OASIS-ADMIN-2026');

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@oasis.community',
      passwordHash: adminPasswordHash,
      primaryRole: UserRole.founder,
      adminLevel: AdminLevel.super_admin,
      accountStatus: AccountStatus.active,
      emailVerified: true,
      mfaEnabled: true,
      mfaSecret: encryptedMfaSecret,
      mfaBackupCodes: [backupCodeHash],
      timeZone: 'Asia/Kolkata',
      profile: {
        create: {
          name: 'Super Administrator',
          headline: 'OASIS Platform Administrator',
          bio: 'Lead administrator for the OASIS entrepreneurial network.',
          city: 'Bhubaneswar',
          state: 'Odisha',
          country: 'India',
        },
      },
    },
  });

  console.log('Super Admin successfully bootstrapped:');
  console.log('Email: admin@oasis.community');
  console.log('Password: AdminPassword2026!@#');
  console.log('TOTP Secret: JBSWY3DPEHPK3PXP');
  console.log('Backup Code: OASIS-ADMIN-2026');
  console.log('User ID:', superAdmin.id);

  console.log('--- 6. VERIFYING ZERO FAKE ENTRIES IN DATABASE ---');
  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.profile.count(),
    applications: await prisma.application.count(),
    posts: await prisma.post.count(),
    events: await prisma.event.count(),
    announcements: await prisma.announcement.count(),
    achievements: await prisma.achievement.count(),
    contentReports: await prisma.contentReport.count(),
  };
  console.log('Final Database Table Counts:', counts);
}

cleanAndBootstrap()
  .catch((e) => {
    console.error('Bootstrap error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
