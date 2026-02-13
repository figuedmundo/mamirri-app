/**
 * Token bucket for rate limiting with a rolling window.
 * Tracks tokens consumed over the last 60 seconds.
 * Supports both Google and Voyage providers with specific estimation logic.
 */
export class TokenRateLimiter {
  private readonly windowMs = 60_000; // 60 seconds
  private readonly maxTokens: number;
  private readonly maxRequests: number;
  private readonly safetyMargin: number;

  private tokenLog: { timestamp: number; tokens: number }[] = [];
  private requestLog: number[] = []; // Timestamps of requests

  constructor(
    maxTokensPerMinute: number,
    maxRequestsPerMinute: number = 100,
    private readonly provider: 'google' | 'voyage' = 'voyage',
  ) {
    // Provider-specific safety margins
    this.safetyMargin = provider === 'voyage' ? 0.9 : 0.85;
    this.maxTokens = maxTokensPerMinute * this.safetyMargin;
    this.maxRequests = maxRequestsPerMinute * this.safetyMargin;
  }

  /**
   * Estimate tokens for a text.
   * Google: 1.6 tokens per word (conservative for medical text)
   * Voyage: 1.4 tokens per word (based on Voyage AI documentation/tokenizer)
   */
  estimateTokens(text: string): number {
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const factor = this.provider === 'voyage' ? 1.4 : 1.6;
    return Math.ceil(words * factor);
  }

  /**
   * Get tokens consumed in the current rolling window
   */
  private getTokensInWindow(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.tokenLog = this.tokenLog.filter((e) => e.timestamp > windowStart);
    return this.tokenLog.reduce((sum, e) => sum + e.tokens, 0);
  }

  /**
   * Get requests made in the current rolling window
   */
  private getRequestsInWindow(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    this.requestLog = this.requestLog.filter((ts) => ts > windowStart);
    return this.requestLog.length;
  }

  /**
   * Record tokens and requests consumed
   */
  recordUsage(tokens: number, requestCount: number = 1): void {
    const now = Date.now();
    this.tokenLog.push({ timestamp: now, tokens });
    for (let i = 0; i < requestCount; i++) {
      this.requestLog.push(now);
    }
  }

  /**
   * Calculate delay needed before consuming more resources.
   */
  getRequiredDelay(tokensNeeded: number, requestsNeeded: number = 1): number {
    const now = Date.now();

    // Check Request Limit
    const currentRequests = this.getRequestsInWindow();
    const availableRequests = this.maxRequests - currentRequests;

    let requestDelay = 0;
    if (requestsNeeded > availableRequests) {
      const requestsToFree = requestsNeeded - availableRequests;
      if (this.requestLog.length >= requestsToFree) {
        const oldestRelevantRequest = this.requestLog[requestsToFree - 1];
        requestDelay = Math.max(
          0,
          oldestRelevantRequest + this.windowMs - now + 100,
        );
      } else {
        requestDelay = 1000;
      }
    }

    // Check Token Limit
    const currentTokens = this.getTokensInWindow();
    const availableTokens = this.maxTokens - currentTokens;

    let tokenDelay = 0;
    if (tokensNeeded > availableTokens) {
      const tokensToFree = tokensNeeded - availableTokens;
      let tokensFreed = 0;
      let waitUntil = now;

      for (const entry of this.tokenLog) {
        tokensFreed += entry.tokens;
        waitUntil = entry.timestamp + this.windowMs;
        if (tokensFreed >= tokensToFree) break;
      }
      tokenDelay = Math.max(0, waitUntil - now + 100);
    }

    const maxDelay = Math.max(requestDelay, tokenDelay);

    if (maxDelay === 0 && (requestsNeeded > 0 || tokensNeeded > 0)) {
      return 200; // Minimal spacing
    }

    return maxDelay;
  }
}
