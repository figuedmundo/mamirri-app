import {
  LogLevel,
  type LogEntry,
  type LoggerConfig,
  SANITIZATION_PATTERNS,
  BLOCKED_FIELDS,
  REDACTED_PLACEHOLDER,
} from '@mamirri/logger';
import { Queue } from './queue';

export class Logger {
  private config: LoggerConfig;
  private queue: Queue;
  private correlationId: string | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.queue = new Queue('logger-queue');
    this.initCorrelationId();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.flushQueue());
    }
  }

  private initCorrelationId() {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('x-correlation-id');
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('x-correlation-id', id);
      }
      this.correlationId = id;
    }
  }

  getCorrelationId(): string | null {
    return this.correlationId;
  }

  log(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error,
  ) {
    if (!this.isEnabled(level)) return;

    const entry = this.createEntry(level, message, meta, error);
    const sanitized = this.sanitize(entry);

    if (this.config.output === 'console') {
      this.writeConsole(sanitized as LogEntry);
    }

    if (this.config.environment !== 'development') {
      this.sendToBackend(sanitized as LogEntry);
    }
  }

  private isEnabled(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    meta?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      levelNum: level,
      message,
      service: this.config.serviceName,
      version: this.config.version,
      environment: this.config.environment,
      correlationId: this.correlationId || undefined,
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

  private sanitize(data: unknown): unknown {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const obj = data as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (BLOCKED_FIELDS.includes(key)) {
        sanitized[key] = REDACTED_PLACEHOLDER('SECRET');
        continue;
      }

      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private sanitizeString(value: string): string {
    let sanitized = value;
    if (SANITIZATION_PATTERNS.EMAIL.test(value))
      sanitized = REDACTED_PLACEHOLDER('EMAIL');
    else if (SANITIZATION_PATTERNS.PHONE.test(value))
      sanitized = REDACTED_PLACEHOLDER('PHONE');
    else if (SANITIZATION_PATTERNS.SSN.test(value))
      sanitized = REDACTED_PLACEHOLDER('SSN');
    else if (SANITIZATION_PATTERNS.CREDIT_CARD.test(value))
      sanitized = REDACTED_PLACEHOLDER('CREDIT_CARD');
    return sanitized;
  }

  private writeConsole(entry: LogEntry) {
    const style = this.getConsoleStyle(entry.levelNum);
    console.log(`%c[${entry.level}] ${entry.message}`, style, entry);
    if (entry.levelNum >= LogLevel.ERROR) {
      console.error(entry);
    }
  }

  private getConsoleStyle(level: number): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: blue';
      case LogLevel.INFO:
        return 'color: green';
      case LogLevel.WARN:
        return 'color: orange';
      case LogLevel.ERROR:
        return 'color: red; font-weight: bold';
      default:
        return 'color: black';
    }
  }

  private async sendToBackend(entry: LogEntry) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.queue.enqueue(entry);
      return;
    }

    try {
      await fetch('/api/v1/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': this.correlationId || '',
        },
        body: JSON.stringify([entry]),
      });
    } catch {
      this.queue.enqueue(entry);
    }
  }

  private async flushQueue() {
    const logs = await this.queue.dequeueAll();
    if (logs.length === 0) return;

    try {
      await fetch('/api/v1/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': this.correlationId || '',
        },
        body: JSON.stringify(logs),
      });
    } catch {
      logs.forEach((log) => this.queue.enqueue(log as LogEntry));
    }
  }

  debug(msg: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, msg, meta);
  }
  info(msg: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.INFO, msg, meta);
  }
  warn(msg: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.WARN, msg, meta);
  }
  error(msg: string, error?: Error, meta?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, msg, meta, error);
  }
}

export const logger = new Logger({
  level: import.meta.env.PROD ? LogLevel.INFO : LogLevel.DEBUG,
  format: 'json',
  output: import.meta.env.PROD ? 'stdout' : 'console',
  serviceName: 'mamirri-client',
  version: '1.0.0',
  environment: import.meta.env.MODE || 'development',
});
