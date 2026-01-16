# Verification Report: Auth Controller Test Fix

**Date:** 2026-01-16
**Verifier:** implementation-verifier
**Status:** ✅ Passed

---

## Executive Summary

The failing test in `modules/auth/auth.controller.spec.ts` ("should call authService.login and set cookie") was investigated and fixed. The issue was due to incorrect mocking of the synchronous `authService.login` method using `mockResolvedValue` (which returns a Promise) instead of `mockReturnValue`.

---

## 1. Issue Analysis

- **Symptom:** `res.cookie` was called with `undefined` instead of the expected refresh token `'rt'`.
- **Root Cause:** The test mocked `authService.login` with `mockResolvedValue`, causing it to return a Promise. The controller calls `authService.login` synchronously (no `await`), so it received a Promise object instead of the token object. Accessing `.refreshToken` on the Promise resulted in `undefined`.
- **Fix:** Changed `mockResolvedValue` to `mockReturnValue` in the test setup for `login` to match the synchronous implementation of `AuthService.login`.

---

## 2. Verification

**Status:** ✅ All Tests Passing

### Test Execution

- Ran `npm test -- modules/auth/auth.controller.spec.ts` -> **PASS**
- Ran full test suite `npm test` -> **PASS** (24 passed, 24 total)

### Notes

- Confirmed that `AuthService.login` is synchronous in `auth.service.ts`.
- Confirmed that `AuthController.login` calls it synchronously.
- Verified no regressions in other auth tests (`register`, `refresh`, `logout`).
