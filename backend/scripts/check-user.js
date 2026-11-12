const fs = require('fs');
const path = require('path');
const readline = require('readline/promises');
const { PrismaClient } = require('@prisma/client');

/**
 * Load key=value pairs from backend/.env into process.env when not already defined.
 * Avoids relying on dotenv being hoisted under strict pnpm layouts.
 */
function loadBackendEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function formatDate(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  const ist = date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${ist} IST`;
}

function formatJsonFields(obj, indent = '  ') {
  if (!obj || typeof obj !== 'object') return [`${indent}(none)`];
  const entries = Object.entries(obj).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  );
  if (entries.length === 0) return [`${indent}(none)`];

  return entries.map(([key, value]) => {
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
    if (typeof value === 'object') {
      return `${indent}${label}: ${JSON.stringify(value)}`;
    }
    const text = String(value);
    const trimmed = text.length > 220 ? `${text.slice(0, 220)}...` : text;
    return `${indent}${label}: ${trimmed}`;
  });
}

function describeEffectiveState(user, latestApp) {
  if (user.accountStatus === 'active') {
    return 'Active community member.';
  }
  if (!latestApp) {
    return `No admissions application submitted yet (account status: ${user.accountStatus}).`;
  }
  if (user.accountStatus === 'pending_verification') {
    return `Application is "${latestApp.status}", and user has NOT verified their email yet.`;
  }
  if (user.accountStatus === 'pending_approval') {
    return `Email verified; application status is "${latestApp.status}".`;
  }
  return `Account status is "${user.accountStatus}"; latest application is "${latestApp.status}".`;
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function promptForEmail() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question('Enter user email to check: ');
    return answer.trim();
  } finally {
    rl.close();
  }
}

const USER_INCLUDE = {
  identities: { select: { provider: true, providerUserId: true, createdAt: true } },
  profile: {
    include: {
      tags: { include: { tag: { select: { name: true, category: true } } } },
    },
  },
  applications: {
    orderBy: { submittedAt: 'desc' },
    include: {
      claimant: { select: { email: true, profile: { select: { name: true } } } },
      reviewer: { select: { email: true, profile: { select: { name: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { authorType: true, body: true, isInternalNote: true, createdAt: true },
      },
    },
  },
  uploadedFiles: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      purpose: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      scanStatus: true,
      status: true,
      createdAt: true,
    },
  },
  sessions: {
    orderBy: { lastActiveAt: 'desc' },
    take: 5,
    select: {
      id: true,
      mfaVerified: true,
      ipAddress: true,
      lastActiveAt: true,
      expiresAt: true,
      createdAt: true,
    },
  },
  restrictions: {
    orderBy: { issuedAt: 'desc' },
    select: {
      type: true,
      reason: true,
      issuedAt: true,
      expiresAt: true,
      resolvedAt: true,
    },
  },
};

async function main() {
  loadBackendEnv();

  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const emailArg = args.find((a) => !a.startsWith('--'));
  const rawEmail = emailArg ? emailArg.trim() : await promptForEmail();

  if (!rawEmail) {
    console.error('Please provide an email address.');
    process.exitCode = 1;
    return;
  }

  const normalizedEmail = rawEmail.toLowerCase();
  const prisma = new PrismaClient();

  try {
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: USER_INCLUDE,
    });

    if (!user && rawEmail !== normalizedEmail) {
      user = await prisma.user.findFirst({
        where: { email: rawEmail },
        include: USER_INCLUDE,
      });
    }

    const evidenceIds = new Set();
    if (user) {
      const attrFileId = user.profile?.roleAttributes?.uploadedEvidence?.fileId;
      if (typeof attrFileId === 'string' && attrFileId) evidenceIds.add(attrFileId);
      for (const app of user.applications) {
        const snap = app.submittedProfileSnapshot;
        if (Array.isArray(snap?.evidenceFileIds)) {
          for (const id of snap.evidenceFileIds) {
            if (typeof id === 'string' && id) evidenceIds.add(id);
          }
        }
        const snapFileId = snap?.roleData?.uploadedEvidence?.fileId;
        if (typeof snapFileId === 'string' && snapFileId) evidenceIds.add(snapFileId);
      }
    }

    const [verificationTokens, emailOutbox, inviteLinks, auditLogs, linkedFiles] = await Promise.all([
      prisma.verificationToken.findMany({
        where: { email: normalizedEmail },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { type: true, expiresAt: true, usedAt: true, createdAt: true },
      }),
      prisma.emailOutbox.findMany({
        where: { to: normalizedEmail },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { subject: true, status: true, attempts: true, errorMessage: true, sentAt: true, createdAt: true },
      }),
      prisma.inviteLink.findMany({
        where: { email: normalizedEmail },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { preApprovedRole: true, status: true, expiresAt: true, usedAt: true, createdAt: true },
      }),
      user
        ? prisma.auditLog.findMany({
            where: {
              OR: [{ actorId: user.id }, { targetId: user.id }],
            },
            orderBy: { timestamp: 'desc' },
            take: 10,
            select: { action: true, targetType: true, reason: true, ipAddress: true, timestamp: true },
          })
        : Promise.resolve([]),
      evidenceIds.size > 0
        ? prisma.uploadedFile.findMany({
            where: { id: { in: Array.from(evidenceIds) } },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              ownerId: true,
              purpose: true,
              filename: true,
              mimeType: true,
              sizeBytes: true,
              scanStatus: true,
              status: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const filesById = new Map();
    for (const f of user?.uploadedFiles || []) filesById.set(f.id, f);
    for (const f of linkedFiles) filesById.set(f.id, f);
    const allFiles = Array.from(filesById.values());

    if (asJson) {
      const safeUser = user
        ? {
            ...user,
            uploadedFiles: allFiles,
            passwordHash: user.passwordHash ? '[SET]' : null,
            mfaSecret: user.mfaSecret ? '[SET]' : null,
            mfaBackupCodes: Array.isArray(user.mfaBackupCodes) ? `[${user.mfaBackupCodes.length} codes]` : null,
          }
        : null;
      console.log(
        JSON.stringify(
          { user: safeUser, verificationTokens, emailOutbox, inviteLinks, auditLogs },
          null,
          2
        )
      );
      return;
    }

    if (!user) {
      console.log(`\nNo user account found for: ${rawEmail}`);
      if (inviteLinks.length || verificationTokens.length || emailOutbox.length) {
        printSection('Related Records Found by Email');
        for (const inv of inviteLinks) {
          console.log(`  Invite Link: role=${inv.preApprovedRole}, status=${inv.status}, created=${formatDate(inv.createdAt)}`);
        }
        for (const mail of emailOutbox) {
          console.log(`  Email: "${mail.subject}" | ${mail.status} | ${formatDate(mail.createdAt)}`);
        }
      }
      return;
    }

    const latestApp = user.applications[0] || null;
    const referenceCode = user.id.slice(0, 8).toUpperCase();
    const providers = user.identities.map((i) => i.provider).join(', ') || 'none';

    printSection('ACCOUNT SUMMARY');
    console.log(`  Name            : ${user.profile?.name || '—'}`);
    console.log(`  Email           : ${user.email}`);
    console.log(`  User ID         : ${user.id}  (Ref: ${referenceCode})`);
    console.log(`  Role            : ${user.primaryRole || '—'}${user.adminLevel ? ` (${user.adminLevel})` : ''}`);
    console.log(`  Account Status  : ${user.accountStatus}`);
    console.log(`  Email Verified  : ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log(`  Phone           : ${user.phone || '—'}${user.phoneVerifiedAt ? ' (Verified)' : ''}`);
    console.log(`  Auth Methods    : Password ${user.passwordHash ? 'Yes' : 'No'} | OAuth: ${providers}`);
    console.log(`  MFA Enabled     : ${user.mfaEnabled ? 'Yes' : 'No'}`);
    console.log(`  Created At      : ${formatDate(user.createdAt)}`);
    console.log(`  Last Login      : ${formatDate(user.lastLoginAt)}`);
    console.log(`  Summary         : ${describeEffectiveState(user, latestApp)}`);

    printSection('PROFILE DETAILS');
    if (!user.profile) {
      console.log('  (No profile record)');
    } else {
      const p = user.profile;
      const location = [p.city, p.state, p.country].filter(Boolean).join(', ') || '—';
      const tags = (p.tags || []).map((t) => t.tag.name).join(', ') || '—';
      console.log(`  Headline        : ${p.headline || '—'}`);
      console.log(`  Location        : ${location}`);
      console.log(`  Bio             : ${p.bio || '—'}`);
      console.log(`  LinkedIn        : ${p.linkedinUrl || '—'}`);
      console.log(`  Website         : ${p.websiteUrl || '—'}`);
      console.log(`  GitHub / X      : ${[p.githubUrl, p.twitterUrl].filter(Boolean).join(' | ') || '—'}`);
      console.log(`  Tags            : ${tags}`);
      if (user.primaryRole === 'mentor') {
        console.log(`  Mentor Status   : verified=${p.mentorVerified ? 'Yes' : 'No'}, availability=${p.mentorAvailability}`);
      }
      if (p.roleAttributes) {
        console.log('  Role Attributes :');
        for (const line of formatJsonFields(p.roleAttributes, '    ')) {
          console.log(line);
        }
      }
    }

    printSection(`APPLICATIONS (${user.applications.length})`);
    if (user.applications.length === 0) {
      console.log('  (No application submitted)');
    } else {
      user.applications.forEach((app, idx) => {
        console.log(`  [${idx + 1}] ID: ${app.id}`);
        console.log(`      Status       : ${app.status}${app.expedited ? ' (Expedited)' : ''}`);
        console.log(`      Submitted At : ${formatDate(app.submittedAt)}`);
        if (app.claimedBy) {
          console.log(`      Claimed By   : ${app.claimant?.profile?.name || app.claimant?.email || app.claimedBy} (${formatDate(app.claimedAt)})`);
        }
        if (app.reviewedBy || app.reviewedAt) {
          console.log(`      Reviewed By  : ${app.reviewer?.profile?.name || app.reviewer?.email || app.reviewedBy || '—'} (${formatDate(app.reviewedAt)})`);
        }
        if (app.decisionReason) {
          console.log(`      Reason       : ${app.decisionReason}`);
        }
        console.log('      Submitted Snapshot:');
        for (const line of formatJsonFields(app.submittedProfileSnapshot, '        ')) {
          console.log(line);
        }
        if (app.messages && app.messages.length > 0) {
          console.log(`      Messages (${app.messages.length}):`);
          for (const msg of app.messages) {
            const flag = msg.isInternalNote ? ' [INTERNAL]' : '';
            console.log(`        - (${msg.authorType}${flag} · ${formatDate(msg.createdAt)}): ${msg.body}`);
          }
        }
      });
    }

    printSection(`UPLOADED DOCUMENTS (${allFiles.length})`);
    if (allFiles.length === 0) {
      console.log('  (None)');
    } else {
      for (const file of allFiles) {
        const sizeKb = Math.max(1, Math.round((file.sizeBytes || 0) / 1024));
        console.log(`  - ${file.purpose}: ${file.filename} (${file.mimeType}, ${sizeKb} KB) | scan=${file.scanStatus}, status=${file.status} | ${formatDate(file.createdAt)}`);
      }
    }

    printSection('EMAIL, VERIFICATION & INVITES');
    if (emailOutbox.length === 0 && verificationTokens.length === 0 && inviteLinks.length === 0) {
      console.log('  (None)');
    } else {
      for (const tok of verificationTokens) {
        const state = tok.usedAt ? `Used (${formatDate(tok.usedAt)})` : new Date(tok.expiresAt) < new Date() ? 'Expired' : 'Active/Unused';
        console.log(`  Token  : ${tok.type} | ${state} | Created: ${formatDate(tok.createdAt)}`);
      }
      for (const mail of emailOutbox) {
        const err = mail.errorMessage ? ` | Error: ${mail.errorMessage}` : '';
        console.log(`  Outbox : "${mail.subject}" | ${mail.status} (attempts: ${mail.attempts}) | ${formatDate(mail.sentAt || mail.createdAt)}${err}`);
      }
      for (const inv of inviteLinks) {
        console.log(`  Invite : role=${inv.preApprovedRole} | ${inv.status} | Created: ${formatDate(inv.createdAt)}`);
      }
    }

    if (user.restrictions.length > 0) {
      printSection(`RESTRICTIONS (${user.restrictions.length})`);
      for (const r of user.restrictions) {
        console.log(`  - ${r.type}: ${r.reason} | Issued: ${formatDate(r.issuedAt)}${r.resolvedAt ? ` | Resolved: ${formatDate(r.resolvedAt)}` : ' | ACTIVE'}`);
      }
    }

    printSection(`RECENT SESSIONS & AUDIT LOGS`);
    const now = new Date();
    const activeSessions = user.sessions.filter((s) => new Date(s.expiresAt) > now);
    console.log(`  Sessions (last ${user.sessions.length}, active ${activeSessions.length}):`);
    if (user.sessions.length === 0) {
      console.log('    (None)');
    } else {
      for (const s of user.sessions) {
        console.log(`    - IP: ${s.ipAddress || '—'} | Last active: ${formatDate(s.lastActiveAt)} | Expires: ${formatDate(s.expiresAt)}`);
      }
    }

    console.log(`  Recent Audit Logs (${auditLogs.length}):`);
    if (auditLogs.length === 0) {
      console.log('    (None)');
    } else {
      for (const log of auditLogs) {
        console.log(`    - ${formatDate(log.timestamp)} | ${log.action} (${log.targetType}) | IP: ${log.ipAddress || '—'}${log.reason ? ` | ${log.reason}` : ''}`);
      }
    }
    console.log('');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Failed to check user details:', err?.message || err);
  process.exit(1);
});
