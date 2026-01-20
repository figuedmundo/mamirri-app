import { Injectable } from '@nestjs/common';
import {
  SANITIZATION_PATTERNS,
  BLOCKED_FIELDS,
  REDACTED_PLACEHOLDER,
} from '@mamirri/logger';

@Injectable()
export class SanitizationService {
  sanitize(data: any): any {
    if (!data) return data;
    if (typeof data !== 'object') return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    // Handle objects
    const sanitized: any = {};

    for (const key of Object.keys(data)) {
      const value = data[key];

      // Check blocked fields
      if (BLOCKED_FIELDS.includes(key)) {
        sanitized[key] = REDACTED_PLACEHOLDER('SECRET');
        continue;
      }

      // Recursively sanitize objects
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
        continue;
      }

      // Check patterns for strings
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeString(value: string): string {
    let sanitized = value;

    if (SANITIZATION_PATTERNS.EMAIL.test(value)) {
      sanitized = REDACTED_PLACEHOLDER('EMAIL');
    } else if (SANITIZATION_PATTERNS.PHONE.test(value)) {
      sanitized = REDACTED_PLACEHOLDER('PHONE');
    } else if (SANITIZATION_PATTERNS.SSN.test(value)) {
      sanitized = REDACTED_PLACEHOLDER('SSN');
    } else if (SANITIZATION_PATTERNS.CREDIT_CARD.test(value)) {
      sanitized = REDACTED_PLACEHOLDER('CREDIT_CARD');
    } else if (SANITIZATION_PATTERNS.JWT.test(value)) {
      sanitized = REDACTED_PLACEHOLDER('JWT');
    }

    return sanitized;
  }
}
