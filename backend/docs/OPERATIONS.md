# OASIS ONE — Operational Runbook

This document details day-to-day operations, background job management, storage driver configuration, and routine maintenance for the **OASIS ONE** backend platform.

---

## 1. Background Jobs Worker

The backend includes a persistent queue worker driven by the MySQL `jobs` table (`backend/src/jobs/jobs.service.ts`).
Each worker instance runs with a unique ID (`worker-<uuid>`) and executes:

1. **Email Delivery**:
   - Asynchronously processes queued notification emails and application status updates.
   - Retries failed deliveries with exponential backoff up to 5 attempts before marking as `failed`.
2. **Expired Record Cleanup**:
   - Auto-releases expired review claims (`claimed_at > 15 minutes` without heartbeat).
   - Inactive session garbage collection (`expires_at < NOW()`).
   - 24-hour celebration window expiry on achievements.
   - Temporary grievance and password reset token expiry.
3. **Automatic Suspension Lift**:
   - Re-activates accounts whose temporary suspensions have elapsed (`restrictions.expires_at < NOW()`).

### Operational Monitoring:
Check queue health directly via MySQL:
```sql
-- Count pending, locked, and failed jobs
SELECT status, COUNT(*) AS count, MIN(scheduled_at) AS oldest_pending
FROM jobs
GROUP BY status;
```

---

## 2. Storage Drivers: Local vs. AWS S3 / MinIO

The storage layer supports both local disk and S3-compatible cloud storage through `backend/src/storage/storage.service.ts`.

### Local Mode (Development Default):
```env
STORAGE_DRIVER=local
```
- Uploaded files are stored in `backend/uploads/`.
- Private downloads are routed through `/api/v1/files/:signedToken`.

### Production Cloud Storage (AWS S3):
```env
STORAGE_DRIVER=s3
S3_REGION=ap-south-2
S3_BUCKET=oasis-one
S3_ACCESS_KEY=<AWS_ACCESS_KEY_ID>
S3_SECRET_KEY=<AWS_SECRET_ACCESS_KEY>
S3_FORCE_PATH_STYLE=false
S3_SSE=AES256
S3_PRESIGN_TTL_SECONDS=120
```

---

## 3. Database Maintenance & Backups

### 3.1 Non-Destructive Migrations
Always deploy database migrations using Prisma's non-destructive deploy runner:
```bash
pnpm --filter oasis-backend prisma:deploy
```

### 3.2 Scheduled MySQL Backups
Run automated logical backups using `mysqldump` with `--single-transaction`:
```bash
mysqldump -h 40.192.42.60 -P 3306 -u testing -p \
  --single-transaction \
  --quick \
  --triggers \
  --routines \
  --default-character-set=utf8mb4 \
  Oasis > oasis_backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 4. Health Checks & Latency Monitoring

The `/api/v1/health` endpoint is unauthenticated and returns real-time diagnostics:
```bash
curl http://localhost:4000/api/v1/health
```

Sample output:
```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-10-16T07:15:00.000Z",
    "services": {
      "database": {
        "status": "ok",
        "latencyMs": 85,
        "engine": "MySQL 8"
      },
      "jobsWorker": {
        "status": "ok"
      }
    }
  }
}
```
Alert if `status !== "ok"` or database `latencyMs > 500ms`.
