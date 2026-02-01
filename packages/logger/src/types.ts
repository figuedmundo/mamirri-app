export enum LogLevel {
  DEBUG = 10,
  VERBOSE = 15,
  INFO = 20,
  WARN = 30,
  ERROR = 40,
  FATAL = 50,
  SILENT = 100,
}

export namespace LogLevel {
  export function fromString(level: string): LogLevel {
    const normalized = level.toUpperCase();
    // @ts-ignore - access enum by string key
    return LogLevel[normalized] || LogLevel.INFO;
  }

  export function isEnabled(
    currentLevel: LogLevel,
    messageLevel: LogLevel,
  ): boolean {
    return messageLevel >= currentLevel;
  }
}

export interface LogEntry {
  timestamp: string;
  level: string;
  levelNum: number;
  message: string;
  service: string;
  version: string;
  environment: string;
  requestId?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    [key: string]: any;
  };
  stack?: string;
  userImpact?: 'low' | 'medium' | 'high';
  retryable?: boolean;
}

export interface LoggerConfig {
  level: LogLevel;
  format: 'pretty' | 'json';
  output: 'console' | 'stdout' | 'file';
  serviceName: string;
  version: string;
  environment: string;
  externalServices?: {
    datadog?: { enabled: boolean; apiKey: string };
    sentry?: { dsn: string };
  };
  sanitization?: {
    enabled: boolean;
    patterns: RegExp[];
  };
}
