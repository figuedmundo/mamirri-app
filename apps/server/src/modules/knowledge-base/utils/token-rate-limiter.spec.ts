import { TokenRateLimiter } from './token-rate-limiter';

describe('TokenRateLimiter', () => {
  describe('estimateTokens', () => {
    it('should use 1.6 factor for google provider', () => {
      const limiter = new TokenRateLimiter(1000, 100, 'google');
      const text = 'one two three four five';
      // 5 words * 1.6 = 8
      expect(limiter.estimateTokens(text)).toBe(8);
    });

    it('should use 1.4 factor for voyage provider', () => {
      const limiter = new TokenRateLimiter(1000, 100, 'voyage');
      const text = 'one two three four five';
      // 5 words * 1.4 = 7
      expect(limiter.estimateTokens(text)).toBe(7);
    });

    it('should handle empty text', () => {
      const limiter = new TokenRateLimiter(1000, 100, 'voyage');
      expect(limiter.estimateTokens('')).toBe(0);
      expect(limiter.estimateTokens('   ')).toBe(0);
    });
  });

  describe('Rate Limiting Logic', () => {
    let limiter: TokenRateLimiter;

    beforeEach(() => {
      // 1000 tokens per minute, 100 requests per minute
      limiter = new TokenRateLimiter(1000, 100, 'voyage');
    });

    it('should return minimal spacing delay (200ms) when under limits', () => {
      const delay = limiter.getRequiredDelay(10, 1);
      expect(delay).toBe(200);
    });

    it('should calculate delay when token limit exceeded', () => {
      // Safety margin for voyage is 0.9, so limit is 900
      limiter.recordUsage(850, 1);

      // Requesting 100 more should trigger delay
      const delay = limiter.getRequiredDelay(100, 1);
      expect(delay).toBeGreaterThan(0);
      expect(delay).toBeLessThanOrEqual(60100);
    });

    it('should calculate delay when request limit exceeded', () => {
      // Safety margin for voyage is 0.9, so limit is 90 requests
      limiter.recordUsage(10, 90);

      const delay = limiter.getRequiredDelay(10, 1);
      expect(delay).toBeGreaterThan(0);
    });
  });
});
