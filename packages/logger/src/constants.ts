export const SANITIZATION_PATTERNS = {
  EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  PHONE: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
  SSN: /\b\d{3}-\d{2}-\d{4}\b/,
  CREDIT_CARD: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/,
  JWT: /eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_.-]*/,
  API_KEY: /("|')?(api[_-]?key|secret|token)("|')?\s*:\s*"[^"]*"/i,
  PASSWORD: /("|')?(password|pass|pwd)("|')?\s*:\s*"[^"]*"/i,
};

export const BLOCKED_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'creditCard',
  'cvv',
  'ssn',
  'socialSecurity',
];

export const REDACTED_PLACEHOLDER = (type: string) => `[REDACTED - ${type}]`;
