# OASIS ONE — Incident Response Runbook

This runbook outlines emergency triage, containment, mitigation, and reporting procedures for security, operational, and data incidents impacting the **OASIS ONE** platform.

---

## 1. Incident Severity Matrix

| Severity | Definition | Examples | Response Target |
| :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Active data breach, unauthorized admin access, system-wide outage, uncontained PII leak | Secret leak in logs, bypass of `AdminGuard`, DB unauthorized access | **15 minutes** |
| **SEV-2 (High)** | Degradation of core user journey, partial failure of queue worker, MFA failure | Google OAuth failure, review queue claim lockouts, email deliverability outage | **1 hour** |
| **SEV-3 (Medium)** | Non-critical feature failure, search degradation, transient errors | Post report queue delay, RSS/announcement delivery hiccup | **4 hours** |

---

## 2. Emergency Operational Commands

### 2.1 Invalidate All Active Sessions for a Compromised User
If an account is hijacked or compromised, terminate all active sessions immediately:

```sql
-- Revoke all sessions for a specific user ID
DELETE FROM sessions WHERE user_id = '<COMPROMISED_USER_ID>';

-- Update account status to suspended
UPDATE users 
SET account_status = 'suspended' 
WHERE id = '<COMPROMISED_USER_ID>';
```

Through the admin API:
```bash
POST /api/v1/admin/members/<COMPROMISED_USER_ID>/restrictions
Content-Type: application/json

{
  "type": "suspension",
  "reason": "Security hold pending incident investigation"
}
```

### 2.2 Global Session Invalidation (Platform-Wide Emergency)
In the event of a compromised `SESSION_SECRET`:
1. Change `SESSION_SECRET` in `.env`.
2. Truncate the `sessions` table:
   ```sql
   TRUNCATE TABLE sessions;
   ```
3. Restart the API servers:
   ```bash
   pnpm --filter oasis-backend start:dev
   ```
   *Every user and admin will be logged out immediately and forced to re-authenticate with credentials and TOTP.*

### 2.3 Rotate Compromised Field Encryption Key
If `FIELD_ENCRYPTION_KEY` is suspected compromised:
1. Re-encrypt all TOTP secrets stored in `users.mfa_secret` using the re-encryption utility script.
2. Force all administrators to re-enroll MFA by setting `mfa_enabled = 0` and `mfa_secret = NULL`.

---

## 3. Audit Log Integrity Verification

The `audit_logs` table is protected by MySQL triggers:
- `audit_logs_no_update`: Blocks `UPDATE` statements on audit rows.
- `audit_logs_no_delete`: Blocks `DELETE` statements on audit rows.

To verify trigger status and inspect recent administrative actions:
```sql
-- Check triggers exist and are ENABLED
SHOW TRIGGERS WHERE `Table` = 'audit_logs';

-- Review the last 50 actions by administrators
SELECT 
  a.created_at, 
  u.email AS actor_email, 
  a.action, 
  a.target_type, 
  a.target_id, 
  a.reason, 
  a.ip_address
FROM audit_logs a
LEFT JOIN users u ON a.actor_id = u.id
ORDER BY a.created_at DESC
LIMIT 50;
```

---

## 4. India DPDP Act 2023 & CERT-In Compliance Protocol

Per the **Digital Personal Data Protection Act (DPDP Act 2023)** and **CERT-In Cyber Security Directions (April 2022)**:

1. **CERT-In Reporting (Mandatory 6-Hour Window)**:
   - Any cybersecurity incident involving unauthorized access, data compromise, or ransomware must be formally notified to CERT-In (incident@cert-in.org.in) within **6 hours** of noticing the incident.
   - Maintain NTP synchronized system logs (`Session time_zone = '+00:00 UTC'`) for minimum 180 days.

2. **Data Protection Board & Data Principal Notification**:
   - If personal data of community members is breached, inform the Data Protection Board of India and affected data principals without unreasonable delay.
   - Specify: Nature of data compromised, potential impact, containment measures taken, and dedicated contact point (`grievance@oasis.community`).

---

## 5. Contact Escalation

- **Security Operations**: `oversight@oasis.community`
- **Data Protection Officer / Grievance Officer**: `grievance@oasis.community`
- **Infrastructure Lead**: Escalation phone on file
