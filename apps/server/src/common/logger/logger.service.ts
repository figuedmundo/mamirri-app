import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { LogLevel, type LogEntry, type LoggerConfig } from '@mamirri/logger';

@Injectable()
export class LoggerService implements OnModuleInit, OnModuleDestroy {
  private config: LoggerConfig;
  private buffer: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly bufferSize = 1000;
  private readonly flushInterval = 1000; // 1s

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  onModuleInit() {
    this.startFlushTimer();

    // Setup signal handlers for dynamic reload
    process.on('SIGHUP', () => {
      this.reloadConfig();
    });
  }

  onModuleDestroy() {
    this.flush();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }

  private reloadConfig() {
    // In a real app, this would re-read env vars or a config file
    // For now, we'll just log that we received the signal
    this.info('Received SIGHUP, reloading configuration');
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private flush() {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    batch.forEach((entry) => this.writeLog(entry));
  }

  private writeLog(entry: LogEntry) {
    const output = this.formatLog(entry);

    if (this.config.output === 'console') {
      // Pretty print for development
      const color = this.getColor(entry.levelNum);
      const reset = '\x1b[0m';
      console.log(
        `${color}[${entry.level}] ${entry.timestamp} [${entry.service}]: ${entry.message}${reset}`,
      );
      if (Object.keys(entry).length > 6) {
        // Log metadata separately for readability
        const {
          timestamp,
          level,
          levelNum,
          message,
          service,
          version,
          ...meta
        } = entry;
        console.log(JSON.stringify(meta, null, 2));
      }
    } else {
      // JSON for production
      process.stdout.write(output + '\n');
    }
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private getColor(level: number): string {
    switch (level) {
      case LogLevel.DEBUG:
        return '\x1b[34m'; // Blue
      case LogLevel.VERBOSE:
        return '\x1b[36m'; // Cyan
      case LogLevel.INFO:
        return '\x1b[32m'; // Green
      case LogLevel.WARN:
        return '\x1b[33m'; // Yellow
      case LogLevel.ERROR:
        return '\x1b[31m'; // Red
      case LogLevel.FATAL:
        return '\x1b[41m'; // Red BG
      default:
        return '\x1b[0m';
    }
  }

  private createEntry(
    level: LogLevel,
    message: string,
    meta?: any,
    error?: Error,
  ): LogEntry {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level] || 'INFO';

    return {
      timestamp,
      level: typeof levelName === 'string' ? levelName : 'INFO',
      levelNum: level,
      message,
      service: this.config.serviceName,
      version: this.config.version,
      environment: this.config.environment,
      ...meta,
      ...(error
        ? {
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        : {}),
    };
  }

  log(level: LogLevel, message: string, meta?: any, error?: Error) {
    if (!LogLevel.isEnabled(this.config.level, level)) {
      return;
    }

    const entry = this.createEntry(level, message, meta, error);

    // In production/async mode, buffer
    if (
      this.config.environment !== 'development' &&
      this.config.output !== 'console'
    ) {
      this.buffer.push(entry);
      if (this.buffer.length >= this.bufferSize) {
        this.flush();
      }
    } else {
      // Sync in dev
      this.writeLog(entry);
    }
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
  verbose(message: string, meta?: any) {
    this.log(LogLevel.VERBOSE, message, meta);
  }
  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }
  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }
  error(message: string, stack?: string, meta?: any) {
    this.log(
      LogLevel.ERROR,
      message,
      meta,
      stack ? { name: 'Error', message: '', stack } : undefined,
    );
  }
  fatal(message: string, error?: Error, meta?: any) {
    this.log(LogLevel.FATAL, message, meta, error);
  }
}
