# ADR-003: Alphanumeric Password Generation Strategy

**Status:** ✅ Accepted  
**Date:** 2026-01-08  
**Deciders:** Sisyphus (AI), User

---

## Context

The project requires a way to generate secure initial passwords for users (Physiotherapists) and internal secrets. Standard tools like `openssl rand -base64` produce special characters (e.g., `/`, `+`, `=`) that often break when used in:

- Environment variable interpolation (shell compatibility)
- URL strings
- Database connection strings
- Copy-pasting by non-technical users

---

## Decision

We implemented a custom bash utility `scripts/generate-password.sh` that defaults to a **Human-Friendly Alphanumeric** set.

Key features:

1.  **Exclusion of Confusing Characters**: Removed `0`, `O`, `1`, `I`, and `l` to prevent user error during manual entry.
2.  **Multiple Modes**:
    - `human` (default): Safe alphanumeric excluding confusing chars.
    - `alpha`: Standard A-Z, a-z, 0-9.
    - `hex`: Safest for internal config/secrets.
3.  **Shell Portability**: Uses `tr` and `/dev/urandom` to remain portable across Linux/macOS environments.

---

## Consequences

### Positive

- ✅ Zero breakage in shell scripts or environment variable files.
- ✅ Higher user satisfaction during initial onboarding (clearer passwords).
- ✅ Consistency across developer environments for secret generation.

### Negative

- ⚠️ Slightly lower entropy per character than the full ASCII set (mitigated by using 16+ character defaults).

### Mitigation

We recommend a minimum length of 16 characters for "human" mode to ensure security strength remains high.

---

## Alternatives Considered

### Option A: OpenSSL Base64 (Rejected)

Rejected because characters like `/` and `+` cause issues in `.env` files and URLs.

### Option B: Library-based generation (e.g., NanoID) (Rejected)

Rejected to avoid adding another runtime dependency for a simple infrastructure task that should be available before `npm install` is necessarily run.

---

## References

- `scripts/generate-password.sh`
