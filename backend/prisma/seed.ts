import { PrismaClient, TagCategory, TagStatus, LegalDocType, UserRole, AdminLevel, AccountStatus } from '@prisma/client';
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

async function main() {
  console.log('Seeding production system configuration and official admin...');

  // 1. Expertise & Sector Tags (idempotent upsert)
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

  // 2. Default Platform Settings
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
    { key: 'app_name', value: 'OASIS ONE' },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  // 3. Initial Legal Documents v1.0
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
      body: `## OASIS ONE Privacy Notice (v1.0)\n\n1. Information We Collect:\n- Registration information: name, email, phone number, location, role, startup details.\n- Communications: application notes, connection requests, support inquiries.\n\n2. Purpose of Collection:\n- Verification and vetting of community membership.\n- Community safety, compliance, and platform operations.\n\n3. Data Retention & Rights:\n- Inactive accounts are flagged after 12 months and deactivated after 15 months.\n- You have the right to request a data export or account deletion.\n- Grievance contact: grievance@oasis.community.`,
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
      body: `## OASIS ONE Community Guidelines (v1.0)\n\n1. Respect and Professionalism:\n- Treat all founders, aspiring entrepreneurs, and mentors with courtesy and respect.\n- Harassment, discrimination, or abusive conduct will result in immediate suspension or revocation.\n\n2. Honest Representation:\n- Provide accurate information about your startup, funding stage, credentials, and achievements.\n- Impersonation or falsification of credentials is strictly prohibited.\n\n3. Zero Spam:\n- Unsolicited commercial spam or mass marketing is strictly prohibited.`,
      isCurrent: true,
      publishedAt: new Date(),
    },
  });

  // 4. Seed Official Super Administrator (No Fake Members)
  const fieldKey = process.env.FIELD_ENCRYPTION_KEY || '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';
  const adminPasswordHash = await argon2.hash('AdminPassword2026!@#', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const totpSecret = 'JBSWY3DPEHPK3PXP';
  const encryptedMfaSecret = encryptField(totpSecret, fieldKey);
  const backupCodeHash = hashToken('OASIS-ADMIN-2026');

  await prisma.user.upsert({
    where: { email: 'admin@oasis.community' },
    update: {
      passwordHash: adminPasswordHash,
      accountStatus: AccountStatus.active,
      adminLevel: AdminLevel.super_admin,
    },
    create: {
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
          city: 'Bhubaneswar',
          state: 'Odisha',
          country: 'India',
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'ssp.subham7@gmail.com' },
    update: {
      accountStatus: AccountStatus.active,
      adminLevel: AdminLevel.super_admin,
      emailVerified: true,
    },
    create: {
      email: 'ssp.subham7@gmail.com',
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
          name: 'Subham (Super Admin)',
          headline: 'OASIS Platform Super Administrator',
          city: 'Bhubaneswar',
          state: 'Odisha',
          country: 'India',
        },
      },
    },
  });

  console.log('Production seeding completed successfully with zero fake members.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
