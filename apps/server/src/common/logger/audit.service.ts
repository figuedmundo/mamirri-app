import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

export interface AuditLogEntry {
  userId: string;
  resource: string;
  resourceId: string;
  action: 'read' | 'create' | 'update' | 'delete';
  purpose?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly logger: LoggerService) {}

  logAccess(entry: AuditLogEntry) {
    this.logger.info('AUDIT_ACCESS', {
      ...entry,
      audit: true,
      timestamp: new Date().toISOString(),
    });
  }
}
