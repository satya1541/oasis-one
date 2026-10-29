import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FilesModule } from '../files/files.module';

@Global()
@Module({
  imports: [FilesModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
