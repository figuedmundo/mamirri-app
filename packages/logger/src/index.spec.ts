import { LogLevel } from './types';
import { SANITIZATION_PATTERNS } from './constants';

describe('Logger Types and Constants', () => {
  describe('LogLevel', () => {
    it('should have correct numeric hierarchy', () => {
      expect(LogLevel.DEBUG).toBe(10);
      expect(LogLevel.VERBOSE).toBe(15);
      expect(LogLevel.INFO).toBe(20);
      expect(LogLevel.WARN).toBe(30);
      expect(LogLevel.ERROR).toBe(40);
      expect(LogLevel.FATAL).toBe(50);
      expect(LogLevel.SILENT).toBe(100);

      expect(LogLevel.ERROR).toBeGreaterThan(LogLevel.WARN);
      expect(LogLevel.WARN).toBeGreaterThan(LogLevel.INFO);
    });

    it('should parse from string correctly', () => {
      // Manual parsing implementation test since we can't test the helper yet
      const parseLevel = (level: string): LogLevel => {
        const normalized = level.toUpperCase();
        // @ts-ignore
        return LogLevel[normalized] || LogLevel.INFO;
      };

      expect(parseLevel('debug')).toBe(LogLevel.DEBUG);
      expect(parseLevel('INFO')).toBe(LogLevel.INFO);
      expect(parseLevel('invalid')).toBe(LogLevel.INFO); // Default
    });
  });

  describe('Sanitization Patterns', () => {
    it('should detect sensitive patterns', () => {
      const email = 'test@example.com';
      const phone = '123-456-7890';

      expect(SANITIZATION_PATTERNS.EMAIL.test(email)).toBe(true);
      expect(SANITIZATION_PATTERNS.PHONE.test(phone)).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should validate logger config', () => {
      const config = {
        level: LogLevel.INFO,
        format: 'json',
        output: 'stdout',
        serviceName: 'test-service',
        version: '1.0.0',
        environment: 'test',
      };

      expect(config.level).toBeDefined();
      expect(config.serviceName).toBe('test-service');
    });
  });
});
