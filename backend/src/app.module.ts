import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { configuration } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MailModule } from './mail/mail.module';
import { JobsModule } from './jobs/jobs.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { ProfilesModule } from './profiles/profiles.module';
import { StartupsModule } from './startups/startups.module';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { LegalModule } from './legal/legal.module';
import { PostsModule } from './posts/posts.module';
import { AchievementsModule } from './achievements/achievements.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ConnectionsModule } from './connections/connections.module';
import { EventsModule } from './events/events.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { SupportModule } from './support/support.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { InvitesModule } from './invites/invites.module';

import { AuthGuard } from './common/guards/auth.guard';
import { CsrfGuard } from './common/guards/csrf.guard';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuditModule,
    RealtimeModule,
    MailModule,
    JobsModule,
    FilesModule,
    AuthModule,
    UsersModule,
    ApplicationsModule,
    ProfilesModule,
    StartupsModule,
    TaxonomyModule,
    LegalModule,
    PostsModule,
    AchievementsModule,
    AnnouncementsModule,
    ConnectionsModule,
    EventsModule,
    TasksModule,
    NotificationsModule,
    SearchModule,
    SupportModule,
    AnalyticsModule,
    AdminModule,
    HealthModule,
    InvitesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
