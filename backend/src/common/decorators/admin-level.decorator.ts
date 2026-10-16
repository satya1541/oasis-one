import { SetMetadata } from '@nestjs/common';
import { AdminLevel } from '@prisma/client';

export const ADMIN_LEVEL_KEY = 'adminLevel';
export const RequireAdminLevel = (level: AdminLevel) => SetMetadata(ADMIN_LEVEL_KEY, level);
