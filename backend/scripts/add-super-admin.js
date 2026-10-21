const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const crypto = require('crypto');

const prisma = new PrismaClient();

function encryptField(text, keyHex) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyHex, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function addSuperAdmin(email) {
  console.log(`Checking user: ${email}...`);
  const fieldKey = process.env.FIELD_ENCRYPTION_KEY || '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';

  const defaultPasswordHash = await argon2.hash('AdminPassword2026!@#', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const totpSecret = 'JBSWY3DPEHPK3PXP';
  const encryptedMfaSecret = encryptField(totpSecret, fieldKey);
  const backupCodeHash = hashToken('OASIS-ADMIN-2026');

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (existing) {
    console.log(`Found existing user with id: ${existing.id}. Promoting to super_admin...`);
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        adminLevel: 'super_admin',
        accountStatus: 'active',
        emailVerified: true,
        mfaEnabled: true,
        mfaSecret: existing.mfaSecret || encryptedMfaSecret,
        mfaBackupCodes: existing.mfaBackupCodes || [backupCodeHash],
      },
      include: { profile: true },
    });
    console.log(`Successfully upgraded ${email} to super_admin!`);
    console.log(JSON.stringify(updated, null, 2));
  } else {
    console.log(`Creating new super_admin user for ${email}...`);
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: defaultPasswordHash,
        primaryRole: 'founder',
        adminLevel: 'super_admin',
        accountStatus: 'active',
        emailVerified: true,
        mfaEnabled: true,
        mfaSecret: encryptedMfaSecret,
        mfaBackupCodes: [backupCodeHash],
        timeZone: 'Asia/Kolkata',
        profile: {
          create: {
            name: 'Subham (Super Admin)',
            headline: 'OASIS Platform Super Administrator',
            bio: 'Platform Administrator & Community Governance Lead.',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            visibilitySettings: {
              email: 'members',
              phone: 'private',
              name: 'members',
              bio: 'members',
            },
          },
        },
      },
      include: { profile: true },
    });
    console.log(`Successfully created super_admin user: ${email}!`);
    console.log(JSON.stringify(created, null, 2));
  }
}

addSuperAdmin('ssp.subham7@gmail.com')
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Error adding super admin:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
