import { SetMetadata } from '@nestjs/common';

export const AdminLevel = {
  super_admin: 'super_admin',
  moderator: 'moderator',
} as const;

export type AdminLevel = (typeof AdminLevel)[keyof typeof AdminLevel];

export const ADMIN_LEVEL_KEY = 'adminLevel';
export const RequireAdminLevel = (level: string) => SetMetadata(ADMIN_LEVEL_KEY, level);

