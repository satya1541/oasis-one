export const configuration = () => ({
  port: parseInt(process.env.PORT || '7500', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'https://oasisodisha.in',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  wsAllowedOrigins: (
    process.env.WS_ALLOWED_ORIGINS ||
    process.env.FRONTEND_URL ||
    'https://oasisodisha.in,https://www.oasisodisha.in,http://localhost:7200,http://localhost:3000'
  ).split(',').map(s => s.trim()),
  trustProxy: parseInt(process.env.TRUST_PROXY || '1', 10),
  
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'fallback-session-secret-change-in-prod-32bytes',
    fieldEncryptionKey: process.env.FIELD_ENCRYPTION_KEY || 'fallback-field-key-change-in-prod-32bytes',
    adminSetupToken: process.env.ADMIN_SETUP_TOKEN || 'admin-setup-token',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://back.oasisodisha.in/api/v1/auth/google/callback',
    },
  },

  mail: {
    transport: process.env.MAIL_TRANSPORT || 'console',
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'OASIS <no-reply@oasisodisha.in>',
    logoUrl: process.env.EMAIL_LOGO_URL || 'https://oasisodisha.in/brand/oasis-logo-email.png',
    grievanceEmail: process.env.GRIEVANCE_EMAIL || 'grievance@oasisodisha.in',
    oversightEmail: process.env.OVERSIGHT_EMAIL || 'oversight@oasisodisha.in',
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 's3',
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'ap-south-2',
    bucket: process.env.S3_BUCKET || process.env.S3_BUCKET_NAME || 'oasis-one',
    accessKey: process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID || '',
    secretKey: process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    sse: process.env.S3_SSE || 'AES256',
    kmsKeyId: process.env.S3_KMS_KEY_ID || undefined,
    presignTtlSeconds: parseInt(process.env.S3_PRESIGN_TTL_SECONDS || '120', 10),
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'console',
    apiKey: process.env.SMS_API_KEY || '',
  },
});
