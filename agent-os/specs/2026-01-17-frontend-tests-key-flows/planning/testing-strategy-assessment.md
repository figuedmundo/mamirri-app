# Testing Strategy Assessment: Playwright vs Chrome DevTools Protocol

## Goal

Select the best tool for **End-to-End (E2E) testing** of the Mamirri App's key user flows.

## Options

### 1. Playwright

A robust E2E testing framework maintained by Microsoft.

**Pros:**

- **Built for Testing:** Designed specifically for assertions, test runners, and reporting.
- **Cross-Browser:** Supports Chromium, Firefox, and WebKit out of the box.
- **Auto-Waiting:** Automatically waits for elements to be actionable (eliminates flaky "sleep" commands).
- **Tooling:** Includes a test generator, trace viewer (for debugging), and UI mode.
- **Parallelism:** Runs tests in parallel by default.
- **Community Standard:** Widely adopted, excellent documentation.

**Cons:**

- **Installation:** Requires installing browser binaries (managed by Playwright).

### 2. Chrome DevTools Protocol (CDP) Direct / Puppeteer

Interacting directly with the browser via CDP (or using Puppeteer as a wrapper).

**Pros:**

- **Raw Control:** Full access to low-level browser primitives.
- **Lightweight:** If you only need to run a script in Chrome.

**Cons:**

- **Not a Test Runner:** You have to build your own assertions, timeouts, and test lifecycle (setup/teardown).
- **Flakiness:** Requires manual handling of waiting for elements/network.
- **Maintenance:** Scripts tend to be more brittle.
- **Limited Scope:** Primarily focused on Chrome.

## Recommendation: Playwright 🏆

**Why:**
For a production roadmap task ("Task 6.13"), we need a **reliable, maintainable test suite**, not just a browser automation script. Playwright provides the structure (Test Runner + Assertions + Reporting) that allows us to write stable TDD flows without reinventing the wheel.

**The "Chrome DevTools" option via MCP** is great for an AI agent to _explore_ a page ad-hoc, but for a **committed codebase feature**, a dedicated framework like Playwright is the engineering standard.

## Implementation Plan

1.  **Install Playwright** in `apps/client`.
2.  **Configure:** Setup `playwright.config.ts` for local execution.
3.  **Write Tests:** Implement the 4 flows as `.spec.ts` files.

### Installation Guide

Run inside `apps/client`:

```bash
pnpm create playwright
# Select TypeScript
# Select 'tests' folder
# Add GitHub Actions workflow? Yes
```

## Next Steps

Proceed with Playwright installation and setup as part of the implementation plan.
