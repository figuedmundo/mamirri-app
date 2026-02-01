import { Body, Controller, Post, Headers } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LogEntry, LogLevel } from '@mamirri/logger';

@Controller('logs')
export class LogsController {
  constructor(private readonly logger: LoggerService) {}

  @Post()
  create(@Body() logs: LogEntry[]) {
    if (!Array.isArray(logs)) return;

    for (const log of logs) {
      // Forward to backend logger with preserved metadata
      // Map string level to LogLevel enum if needed, or pass as is if logger supports it
      const level = LogLevel.fromString(log.level);

      this.logger.log(level, log.message, {
        ...log,
        source: 'frontend',
      });
    }

    return { success: true };
  }
}
