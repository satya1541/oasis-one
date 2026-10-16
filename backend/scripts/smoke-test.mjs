// OASIS ONE Backend Comprehensive Smoke Test Suite
import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import crypto from 'node:crypto';

const BASE_URL = 'http://localhost:7500/api/v1';
const prisma = new PrismaClient();
const FIELD_ENCRYPTION_KEY = '2db43747f3af14adaeaec4751f89e14f7861a862f41e520a71c7e796ef450789';

function decryptField(text, hexKey) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(hexKey, 'hex'), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
}

async function main() {
  console.log('🚀 Running OASIS ONE Backend Comprehensive Verification Suite...\n');
  let failures = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      console.error(`  ❌ [FAIL] ${name} ${details}`);
      failures++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    assert(res.status === 200 && json?.data?.status === 'ok', 'Health Check (/health)', JSON.stringify(json));
    assert(json?.data?.services?.database?.status === 'ok', 'Database Connection & Latency Check');
  } catch (err) {
    assert(false, 'Health Check Exception', err.message);
  }

  // 2. Public Taxonomy Endpoints
  try {
    const res = await fetch(`${BASE_URL}/taxonomy/sectors`);
    const json = await res.json();
    assert(res.status === 200 && Array.isArray(json?.data) && json.data.length > 0, 'Taxonomy Sectors (/taxonomy/sectors)', `count: ${json?.data?.length}`);
  } catch (err) {
    assert(false, 'Taxonomy Sectors Exception', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/taxonomy/expertise`);
    const json = await res.json();
    assert(res.status === 200 && Array.isArray(json?.data) && json.data.length > 0, 'Taxonomy Expertise (/taxonomy/expertise)', `count: ${json?.data?.length}`);
  } catch (err) {
    assert(false, 'Taxonomy Expertise Exception', err.message);
  }

  // 3. Public Legal Endpoints
  try {
    const res = await fetch(`${BASE_URL}/legal/current`);
    const json = await res.json();
    assert(res.status === 200 && json?.data?.privacy_notice !== undefined, 'Current Legal Docs (/legal/current)');
  } catch (err) {
    assert(false, 'Legal Current Exception', err.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/config/public`);
    const json = await res.json();
    assert(res.status === 200 && json?.data?.minAge !== undefined, 'Public System Config (/config/public)');
  } catch (err) {
    assert(false, 'Config Public Exception', err.message);
  }

  // 4. Admin Bootstrap
  let adminSessionCookie = '';
  try {
    const setupRes = await fetch(`${BASE_URL}/admin/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: '88223b186fea97f292073dfdc37825f9',
        name: 'Super Administrator',
        email: 'admin@oasis.community',
        password: 'AdminPassword2026!@#'
      }),
    });
    const setupJson = await setupRes.json();
    if (setupRes.status === 201 || setupRes.status === 200) {
      assert(true, 'Admin Bootstrap One-Time Setup (/admin/setup)');
    } else if (setupRes.status === 403) {
      console.log('  ℹ️ Admin already bootstrapped previously (expected behavior for repeat runs)');
      assert(true, 'Admin Bootstrap Guard Check');
    } else {
      assert(false, 'Admin Bootstrap Failed', JSON.stringify(setupJson));
    }
  } catch (err) {
    assert(false, 'Admin Bootstrap Exception', err.message);
  }

  // 5. Admin Login & MFA Verification Flow
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@oasis.community',
        password: 'AdminPassword2026!@#'
      }),
    });
    const rawCookies = loginRes.headers.get('set-cookie') || '';
    const loginJson = await loginRes.json();
    assert(loginRes.status === 201 || loginRes.status === 200, 'Admin Login Status');
    assert(loginJson?.data?.user?.email === 'admin@oasis.community', 'Admin User Authenticated');
    assert(loginJson?.data?.user?.requiresMfa === true, 'Admin Mandatory MFA Triggered');

    const match = rawCookies.match(/oasis_sid=([^;]+)/);
    if (match) {
      adminSessionCookie = `oasis_sid=${match[1]}`;
      assert(true, 'Admin Session Cookie Received');

      // Generate TOTP code from user record
      const adminUser = await prisma.user.findUnique({ where: { email: 'admin@oasis.community' } });
      const secret = decryptField(adminUser.mfaSecret, FIELD_ENCRYPTION_KEY);
      const totpCode = authenticator.generate(secret);

      const mfaRes = await fetch(`${BASE_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          Cookie: adminSessionCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: totpCode }),
      });
      const mfaJson = await mfaRes.json();
      assert(mfaRes.status === 201 || mfaRes.status === 200, 'Admin TOTP MFA Elevation (/auth/mfa/verify)', JSON.stringify(mfaJson));
    } else {
      assert(false, 'Session cookie not found in response headers', rawCookies);
    }
  } catch (err) {
    assert(false, 'Admin Login/MFA Exception', err.message);
  }

  // 6. Admin Overview & Self Profile Check
  if (adminSessionCookie) {
    try {
      const overviewRes = await fetch(`${BASE_URL}/admin/overview`, {
        headers: { Cookie: adminSessionCookie },
      });
      const overviewJson = await overviewRes.json();
      assert(overviewRes.status === 200 && overviewJson?.data?.pendingApplications !== undefined, 'Admin Protected Overview (/admin/overview)');
    } catch (err) {
      assert(false, 'Admin Overview Exception', err.message);
    }

    try {
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Cookie: adminSessionCookie },
      });
      const meJson = await meRes.json();
      assert(meRes.status === 200 && meJson?.data?.adminLevel === 'super_admin' && meJson?.data?.mfaVerified === true, 'Auth Profile Elevated Self Check (/auth/me)');
    } catch (err) {
      assert(false, 'Auth Me Exception', err.message);
    }
  }

  // 7. Member Registration Flow (Applicant)
  const testUserEmail = `applicant_${Date.now()}@example.com`;
  let applicantSessionCookie = '';
  try {
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'ApplicantPassword2026!@#',
        fullName: 'Jane Candidate',
        role: 'aspiring_entrepreneur',
        ageConfirmed: true,
        privacyNoticeConsent: true,
        communityGuidelinesConsent: true,
        phone: '+919876543210',
        roleData: {
          currentStatus: 'student',
          university: 'IIT Bombay',
          major: 'Computer Science',
          graduationYear: 2027,
          portfolioUrl: 'https://janecandidate.dev'
        }
      }),
    });
    const regCookies = regRes.headers.get('set-cookie') || '';
    const regJson = await regRes.json();
    assert(regRes.status === 201 && regJson?.data?.user?.accountStatus === 'pending_verification', 'User Registration (/auth/register)', JSON.stringify(regJson));
    const match = regCookies.match(/oasis_sid=([^;]+)/);
    if (match) {
      applicantSessionCookie = `oasis_sid=${match[1]}`;
    }
  } catch (err) {
    assert(false, 'Registration Exception', err.message);
  }

  // 8. Applicant Check (/applications/me)
  if (applicantSessionCookie) {
    try {
      const appRes = await fetch(`${BASE_URL}/applications/me`, {
        headers: { Cookie: applicantSessionCookie },
      });
      const appJson = await appRes.json();
      assert(appRes.status === 200 && appJson?.data?.status === 'pending', 'Applicant Applications Status (/applications/me)', JSON.stringify(appJson));
    } catch (err) {
      assert(false, 'Applicant Applications Exception', err.message);
    }
  }

  // 9. Admin Applications Inspection, Claim & Approval Flow
  if (adminSessionCookie) {
    try {
      const queueRes = await fetch(`${BASE_URL}/admin/applications`, {
        headers: { Cookie: adminSessionCookie },
      });
      const queueJson = await queueRes.json();
      const apps = Array.isArray(queueJson?.data) ? queueJson.data : (queueJson?.data?.items || []);
      assert(queueRes.status === 200 && Array.isArray(apps), 'Admin Applications Queue (/admin/applications)');
      
      const targetApp = apps.find(item => item.email === testUserEmail);
      if (targetApp) {
        // Claim application
        const claimRes = await fetch(`${BASE_URL}/admin/applications/${targetApp.id}/claim`, {
          method: 'POST',
          headers: { Cookie: adminSessionCookie },
        });
        const claimJson = await claimRes.json();
        assert(claimRes.status === 201 || claimRes.status === 200, 'Admin Claim Application (/admin/applications/:id/claim)');

        // Approve application
        const decideRes = await fetch(`${BASE_URL}/admin/applications/${targetApp.id}/decision`, {
          method: 'POST',
          headers: { 
            Cookie: adminSessionCookie,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            decision: 'approve',
            reason: 'Applicant meets high criteria for entrepreneur cohort.',
            rubric: { motivation: 5, trackRecord: 4, commitment: 5 }
          }),
        });
        const decideJson = await decideRes.json();
        assert(decideRes.status === 201 || decideRes.status === 200, 'Admin Approve Application (/admin/applications/:id/decision)', JSON.stringify(decideJson));
        assert(decideJson?.data?.decision === 'approve', 'Application Approved Status Confirmed');
      } else {
        assert(false, 'Find test application in queue', `email ${testUserEmail} not found`);
      }
    } catch (err) {
      assert(false, 'Review Queue Workflow Exception', err.message);
    }
  }

  // 10. Search Query Test
  if (adminSessionCookie) {
    try {
      const searchRes = await fetch(`${BASE_URL}/search?q=Jane`, {
        headers: { Cookie: adminSessionCookie },
      });
      const searchJson = await searchRes.json();
      assert(searchRes.status === 200 && searchJson?.data !== undefined, 'Search Service Endpoint (/search?q=Jane)');
    } catch (err) {
      assert(false, 'Search Exception', err.message);
    }
  }

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log('🎉 ALL BACKEND SMOKE TESTS PASSED SUCCESSFULLY (100%)!');
  } else {
    console.error(`💥 ${failures} TEST(S) FAILED. REVIEW OUTPUT ABOVE.`);
  }
  console.log(`========================================\n`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
