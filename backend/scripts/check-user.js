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

function printUsage() {
  console.log(`Usage:
  node scripts/check-user.js [email] [options]
  pnpm check-user [email] [options]

Options:
  --routes, -r      Include full chronological route & timing history
  --routes-only     Show only compact account header + route & timing history
  --limit <N>       Max route visits to load (default: 50, max: 500)
  --days <N>        Only inspect routes/audit events from the last N days
  --json            Output machine-readable JSON
  --help, -h        Show this help message
`);
}

function parseCliArgs(args) {
  let includeRoutes = false;
  let noRoutesPrompt = false;
  let routesOnly = false;
  let asJson = false;
  let help = false;
  let routeLimit = 50;
  let days = null;
  let emailArg = null;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--routes' || arg === '-r') {
      includeRoutes = true;
    } else if (arg === '--routes-only') {
      includeRoutes = true;
      routesOnly = true;
    } else if (arg === '--no-routes') {
      noRoutesPrompt = true;
    } else if (arg === '--json') {
      asJson = true;
      noRoutesPrompt = true;
    } else if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--limit' && args[i + 1]) {
      routeLimit = Number(args[++i]);
    } else if (arg.startsWith('--limit=')) {
      routeLimit = Number(arg.slice('--limit='.length));
    } else if (arg === '--days' && args[i + 1]) {
      days = Number(args[++i]);
    } else if (arg.startsWith('--days=')) {
      days = Number(arg.slice('--days='.length));
    } else if (!arg.startsWith('-') && !emailArg) {
      emailArg = arg;
    }
  }

  if (!Number.isFinite(routeLimit) || routeLimit < 1) routeLimit = 50;
  routeLimit = Math.min(500, Math.round(routeLimit));

  if (days !== null && (!Number.isFinite(days) || days <= 0)) {
    days = null;
  }

  return { includeRoutes, noRoutesPrompt, routesOnly, asJson, help, routeLimit, days, emailArg };
}

function formatDuration(ms) {
  if (ms === null || ms === undefined || !Number.isFinite(ms) || ms < 0) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

function formatTimeOnly(dateValue) {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  const ist = date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  return `${ist} IST`;
}

function isSameIstDate(a, b) {
  if (!a || !b) return false;
  const da = new Date(a).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  const db = new Date(b).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  return da === db;
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function promptInteractiveOptions(needsEmail, askRoutesOption) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const email = needsEmail ? (await rl.question('Enter user email to check: ')).trim() : '';
    let includeRoutes = false;
    if (askRoutesOption) {
      const ans = (await rl.question('Include route & timing history? (y/N): ')).trim().toLowerCase();
      includeRoutes = ans === 'y' || ans === 'yes';
    }
    return { email, includeRoutes };
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

function buildRouteVisits(rawRouteEvents) {
  // Incoming events are newest-first; sort chronologically oldest -> newest
  const chronological = [...rawRouteEvents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return chronological.map((ev, index) => {
    const props = ev.props && typeof ev.props === 'object' ? ev.props : {};
    const enteredAt = props.enteredAt || ev.createdAt;
    const enteredMs = new Date(enteredAt).getTime();
    const leftAt = props.leftAt || null;
    const leftMs = leftAt ? new Date(leftAt).getTime() : NaN;

    let durationMs =
      typeof props.durationMs === 'number' && Number.isFinite(props.durationMs)
        ? Math.max(0, Math.round(props.durationMs))
        : null;
    let durationKind = leftAt ? 'exact' : durationMs !== null ? 'heartbeat' : 'open';

    if (!Number.isNaN(enteredMs) && !Number.isNaN(leftMs) && leftMs >= enteredMs) {
      durationMs = Math.round(leftMs - enteredMs);
      durationKind = 'exact';
    } else if (durationMs === null && index < chronological.length - 1) {
      // Infer gap when user hopped to next route without firing pagehide
      const nextProps =
        chronological[index + 1].props && typeof chronological[index + 1].props === 'object'
          ? chronological[index + 1].props
          : {};
      const nextEnteredMs = new Date(nextProps.enteredAt || chronological[index + 1].createdAt).getTime();
      const diff = nextEnteredMs - enteredMs;
      if (Number.isFinite(diff) && diff >= 0 && diff <= 30 * 60 * 1000) {
        durationMs = Math.round(diff);
        durationKind = 'inferred';
      }
    }

    return {
      id: ev.id,
      path: props.path || '(unknown)',
      fullPath: props.fullPath || props.path || '(unknown)',
      fromPath: props.fromPath || null,
      enteredAt,
      enteredMs: Number.isNaN(enteredMs) ? new Date(ev.createdAt).getTime() : enteredMs,
      leftAt,
      durationMs,
      durationKind,
      trigger: props.trigger || props.phase || 'enter',
      accountStatus: props.accountStatus || null,
      applicationStatus: props.applicationStatus || null,
    };
  });
}

function summarizeRouteVisits(visits) {
  const byPath = new Map();
  let totalDurationMs = 0;

  for (const v of visits) {
    const key = v.path || v.fullPath;
    const cur = byPath.get(key) || { path: key, visits: 0, totalMs: 0 };
    cur.visits += 1;
    if (typeof v.durationMs === 'number') {
      cur.totalMs += v.durationMs;
      totalDurationMs += v.durationMs;
    }
    byPath.set(key, cur);
  }

  // Detect rapid back-and-forth redirect loops (A -> B -> A or >= 3 rapid hops < 5s)
  const alerts = [];
  for (let i = 0; i < visits.length - 2; i += 1) {
    const a = visits[i];
    const b = visits[i + 1];
    const c = visits[i + 2];
    const spanMs = c.enteredMs - a.enteredMs;
    if (a.path !== b.path && a.path === c.path && spanMs >= 0 && spanMs <= 60000) {
      alerts.push(
        `Bounce loop detected: ${a.path} -> ${b.path} -> ${c.path} within ${formatDuration(spanMs)} (at ${formatDate(a.enteredAt)})`,
      );
    }
  }

  const rapidRedirectCount = visits.filter(
    (v) => typeof v.durationMs === 'number' && v.durationMs < 3000 && v.durationKind !== 'open',
  ).length;

  const topRoutes = Array.from(byPath.values()).sort((x, y) => y.visits - x.visits || y.totalMs - x.totalMs);
  return { totalDurationMs, topRoutes, alerts: Array.from(new Set(alerts)), rapidRedirectCount };
}

function printRouteTimeline(visits, auditLogs) {
  printSection(`ROUTE & TIMING HISTORY (${visits.length} visits)`);
  if (visits.length === 0) {
    console.log('  (No tracked routes recorded for this user in the selected range.)');
    if (auditLogs.length > 0) {
      console.log('  Backend Auth/Audit Events:');
      const chronologicalAudits = [...auditLogs].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      for (const log of chronologicalAudits) {
        console.log(
          `    [EVENT] ${formatDate(log.timestamp)} | ${log.action} (${log.targetType}) | IP: ${log.ipAddress || '—'}${log.reason ? ` | ${log.reason}` : ''}`,
        );
      }
    }
    return;
  }

  const summary = summarizeRouteVisits(visits);
  console.log(`  Total Tracked Time : ${formatDuration(summary.totalDurationMs)} | Rapid hops (<3s): ${summary.rapidRedirectCount}`);
  console.log('  By Route           :');
  for (const r of summary.topRoutes) {
    console.log(`    - ${r.path.padEnd(28, ' ')} : ${String(r.visits).padStart(2, ' ')} visit(s), stayed ${formatDuration(r.totalMs)}`);
  }

  if (summary.alerts.length > 0) {
    console.log('  Possible Redirect/Bounce Issues:');
    for (const alert of summary.alerts.slice(0, 10)) {
      console.log(`    ! ${alert}`);
    }
  }

  // Merge route visits and audit events into one chronological story
  const timeline = [
    ...visits.map((v, idx) => ({
      kind: 'route',
      ts: v.enteredMs,
      order: idx + 1,
      visit: v,
    })),
    ...auditLogs.map((log) => ({
      kind: 'audit',
      ts: new Date(log.timestamp).getTime(),
      log,
    })),
  ].sort((a, b) => a.ts - b.ts);

  console.log('\n  Chronological Timeline (oldest -> newest):');
  for (const item of timeline) {
    if (item.kind === 'audit') {
      const log = item.log;
      console.log(
        `    [EVENT] ${formatDate(log.timestamp)} | ${log.action} (${log.targetType}) | IP: ${log.ipAddress || '—'}${log.reason ? ` | ${log.reason}` : ''}`,
      );
      continue;
    }

    const v = item.visit;
    const num = String(item.order).padStart(2, ' ');
    const enteredStr = formatDate(v.enteredAt);
    const leftStr = v.leftAt
      ? isSameIstDate(v.enteredAt, v.leftAt)
        ? formatTimeOnly(v.leftAt)
        : formatDate(v.leftAt)
      : 'active/no-exit';

    let stayed = '—';
    if (v.durationKind === 'exact') stayed = formatDuration(v.durationMs);
    else if (v.durationKind === 'heartbeat') stayed = `~${formatDuration(v.durationMs)} (tab hidden)`;
    else if (v.durationKind === 'inferred') stayed = `~${formatDuration(v.durationMs)} (inferred)`;
    else stayed = 'open';

    const fromTag = v.fromPath ? ` (from: ${v.fromPath})` : '';
    const stateTag =
      v.accountStatus || v.applicationStatus
        ? ` [acct=${v.accountStatus || '?'}, app=${v.applicationStatus || '?'}]`
        : '';

    console.log(
      `    [${num}] ${enteredStr} -> ${leftStr} | Stayed: ${stayed.padEnd(14, ' ')} | ${v.fullPath}${fromTag}${stateTag}`,
    );
  }
}

async function main() {
  loadBackendEnv();

  const cli = parseCliArgs(process.argv.slice(2));
  if (cli.help) {
    printUsage();
    return;
  }

  let rawEmail = cli.emailArg ? cli.emailArg.trim() : '';
  let includeRoutes = cli.includeRoutes;

  if (!rawEmail || (!includeRoutes && !cli.noRoutesPrompt && !cli.emailArg)) {
    const prompted = await promptInteractiveOptions(!rawEmail, !includeRoutes && !cli.noRoutesPrompt && !cli.emailArg);
    if (!rawEmail) rawEmail = prompted.email;
    if (prompted.includeRoutes) includeRoutes = true;
  }

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

    const sinceDate = cli.days ? new Date(Date.now() - cli.days * 24 * 60 * 60 * 1000) : null;
    const routeWhere = user
      ? {
          userId: user.id,
          name: 'route_visit',
          ...(sinceDate ? { createdAt: { gte: sinceDate } } : {}),
        }
      : null;

    const auditTake = includeRoutes ? cli.routeLimit : 10;

    const [verificationTokens, emailOutbox, inviteLinks, auditLogs, linkedFiles, routeCount, latestRouteEvent, routeEvents] =
      await Promise.all([
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
                ...(sinceDate ? { timestamp: { gte: sinceDate } } : {}),
              },
              orderBy: { timestamp: 'desc' },
              take: auditTake,
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
        routeWhere ? prisma.analyticsEvent.count({ where: routeWhere }) : Promise.resolve(0),
        routeWhere
          ? prisma.analyticsEvent.findFirst({
              where: routeWhere,
              orderBy: { createdAt: 'desc' },
              select: { id: true, props: true, createdAt: true },
            })
          : Promise.resolve(null),
        routeWhere && includeRoutes
          ? prisma.analyticsEvent.findMany({
              where: routeWhere,
              orderBy: { createdAt: 'desc' },
              take: cli.routeLimit,
              select: { id: true, props: true, createdAt: true },
            })
          : Promise.resolve([]),
      ]);

    const filesById = new Map();
    for (const f of user?.uploadedFiles || []) filesById.set(f.id, f);
    for (const f of linkedFiles) filesById.set(f.id, f);
    const allFiles = Array.from(filesById.values());
    const routeHistory = includeRoutes ? buildRouteVisits(routeEvents) : undefined;

    if (cli.asJson) {
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
          {
            user: safeUser,
            verificationTokens,
            emailOutbox,
            inviteLinks,
            auditLogs,
            routeStats: { totalTrackedRoutes: routeCount, latestRoute: latestRouteEvent?.props || null },
            ...(routeHistory !== undefined ? { routeHistory } : {}),
          },
          null,
          2,
        ),
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
    if (routeCount > 0) {
      const latestPath = latestRouteEvent?.props?.fullPath || latestRouteEvent?.props?.path || '—';
      const latestAt = formatDate(latestRouteEvent?.props?.enteredAt || latestRouteEvent?.createdAt);
      const hint = includeRoutes ? '' : '  (run with --routes or answer "y" to view timeline)';
      console.log(`  Tracked Routes  : ${routeCount} visits (latest: ${latestPath} at ${latestAt})${hint}`);
    } else {
      console.log(`  Tracked Routes  : 0 recorded`);
    }

    if (cli.routesOnly) {
      printRouteTimeline(routeHistory || [], auditLogs);
      console.log('');
      return;
    }

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

    if (includeRoutes) {
      printRouteTimeline(routeHistory || [], auditLogs);
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
