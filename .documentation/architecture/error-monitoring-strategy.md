# Error Monitoring Strategy Analysis for MamirriApp

## Current Situation

Your production app currently has the client attempting to send logs to an API endpoint that doesn't exist. This indicates:

1. The frontend has error handling code trying to report errors
2. No backend controller exists to receive and process these logs
3. You're essentially flying blind on production errors

## Your Constraints

- **Budget:** $0 for MVP stage (absolutely free required)
- **Location:** Developer in Malta, stakeholder in Bolivia (minimal impact on tool choice)
- **Stack:** NestJS backend + React 19 frontend
- **Mission:** Privacy-first clinical application (critical consideration)
- **Stage:** MVP - need quick setup, minimal complexity

## Recommendation Summary

**🏆 WINNER: Sentry (Free Tier)** for immediate implementation

**Alternative to consider:** GlitchTip (self-hosted) if privacy compliance becomes stricter

---

## Detailed Analysis of Options

### 1. Sentry (Recommended) ⭐

**Free Tier Limits:**

- 5,000 error events/month
- Unlimited projects
- 14-day data retention
- 1 user (solo developer perfect)

**Pros:**

- ✅ Industry standard - extensive documentation and community support
- ✅ Exceptional React integration (Error Boundaries, Redux, Router)
- ✅ Source map support for minified code
- ✅ Performance monitoring included
- ✅ Real-time alerts (Slack, Email)
- ✅ Breadcrumbs show user actions leading to error
- ✅ Release tracking - know which deployment caused errors
- ✅ Zero infrastructure to manage
- ✅ Quick setup (15 minutes)

**Cons:**

- ❌ Only 5,000 errors/month (sufficient for MVP)
- ❌ 14-day data retention (OK for immediate debugging)
- ❌ Data stored on Sentry's servers (privacy consideration)

**Why it's best for you:**

- Fastest time-to-value - you can have it running today
- Works perfectly with your React 19 + NestJS stack
- 5,000 errors/month is plenty for an MVP stage
- No infrastructure overhead while you focus on product
- Best debugging experience (source maps, breadcrumbs, context)

**Setup effort:** ~15 minutes

---

### 2. Firebase Crashlytics (Second Choice)

**Free Tier:**

- Completely unlimited errors
- Part of Firebase Spark plan (free)
- No credit card required

**Pros:**

- ✅ Truly unlimited errors
- ✅ Completely free forever
- ✅ Google infrastructure (reliable)
- ✅ Good mobile app support
- ✅ Integrates with Firebase Analytics

**Cons:**

- ❌ Primarily designed for mobile apps (iOS/Android)
- ❌ Web app support is secondary/weaker
- ❌ Less detailed error context for web
- ❌ No session replay
- ❌ Google ecosystem lock-in
- ❌ Another Google service to manage

**Verdict:** Good for mobile-first apps, but Sentry is better for web applications like yours.

---

### 3. Highlight.io (Third Choice)

**Free Tier:**

- 500 sessions/month
- 1,000 errors/month
- Up to 15 team members
- AI error grouping

**Pros:**

- ✅ Session replay (see exactly what user did before error)
- ✅ Open source (can self-host later)
- ✅ Modern UI
- ✅ Good for UX debugging
- ✅ Full-stack monitoring in one tool

**Cons:**

- ❌ Only 500 sessions/month (very limiting)
- ❌ Only 1,000 errors/month (less than Sentry)
- ❌ Newer tool - less mature ecosystem
- ❌ Session replay may be overkill for MVP
- ❌ More complex setup

**Verdict:** Great for UX-focused debugging, but limits are too restrictive for production use at MVP stage.

---

### 4. GlitchTip (Best for Privacy-First)

**Free Tier:**

- Open source - completely free
- Self-hosted on your infrastructure
- No limits (depends on your server capacity)

**Pros:**

- ✅ **100% free and open source**
- ✅ Complete data ownership (critical for clinical data)
- ✅ Sentry-compatible API (easy migration from Sentry later)
- ✅ Self-hosted = full privacy control
- ✅ Can run on cheap VPS (~$5/month DigitalOcean)

**Cons:**

- ❌ Requires infrastructure setup and maintenance
- ❌ Need to manage database, Redis, etc.
- ❌ More time investment upfront
- ❌ You're responsible for uptime
- ❌ No hosted version (must self-host)

**Verdict:** Ideal for privacy-first clinical apps long-term, but adds infrastructure complexity during MVP.

**Recommendation:** Evaluate this when you have more time/resources or stricter compliance requirements.

---

### 5. Rollbar

**Free Tier:**

- Limited free plan (check current limits)
- 5,000 error events/month (similar to Sentry)

**Pros:**

- ✅ Good error grouping
- ✅ Real-time alerts

**Cons:**

- ❌ Less popular than Sentry (smaller community)
- ❌ Weaker React integration
- ❌ Similar limits to Sentry but less features

**Verdict:** No compelling advantage over Sentry.

---

### 6. Bugsnag

**Free Tier:**

- Solo developer plan
- ~150K events/month (generous)

**Pros:**

- ✅ Generous free tier
- ✅ Good stability scoring

**Cons:**

- ❌ Paid plans expensive
- ❌ Less intuitive UI than Sentry
- ❌ Smaller community

**Verdict:** Good alternative, but Sentry has better DX and integrations.

---

### 7. In-House Solution (NOT Recommended for MVP)

**Why you should NOT build your own:**

1. **Complexity:** Error monitoring involves:
   - Error aggregation and grouping
   - Source map handling
   - Rate limiting
   - Alerting system
   - Dashboard UI
   - Data retention policies
   - Search and filtering

2. **Time Cost:** Building a decent error tracking system would take 1-2 weeks of focused development

3. **Opportunity Cost:** Every hour spent on infrastructure is an hour not spent on your core product

4. **Maintenance Burden:** You'll need to maintain and improve it ongoing

5. **No Competitive Advantage:** Error tracking is not your differentiator

**When to consider in-house:**

- Strict compliance requiring on-premise (but use GlitchTip instead)
- Massive scale where costs exceed $500/month
- You have dedicated DevOps team

**Verdict:** Don't build it. Use Sentry or GlitchTip.

---

## Comparison Matrix

| Tool                     | Monthly Cost | Error Limit  | Privacy         | Setup Time | Best For              |
| ------------------------ | ------------ | ------------ | --------------- | ---------- | --------------------- |
| **Sentry**               | $0           | 5,000 errors | Hosted (USA)    | 15 min     | MVP/Startup           |
| **Firebase Crashlytics** | $0           | Unlimited    | Hosted (Google) | 30 min     | Mobile-first          |
| **Highlight.io**         | $0           | 1,000 errors | Hosted (USA)    | 30 min     | UX debugging          |
| **GlitchTip**            | $5-10 VPS    | Unlimited    | Self-hosted     | 2-4 hours  | Privacy-first         |
| **Rollbar**              | $0           | 5,000 errors | Hosted (USA)    | 20 min     | Alternative to Sentry |
| **Bugsnag**              | $0           | 150K events  | Hosted (USA)    | 20 min     | Solo devs             |
| **In-house**             | $5-10 VPS    | Unlimited    | Self-hosted     | 1-2 weeks  | ❌ Not recommended    |

---

## Implementation Plan

### Phase 1: Immediate (Today) - Sentry Setup

**Step 1: Create Sentry Account**

1. Go to sentry.io
2. Sign up with your Google/GitHub account
3. Create a new project for "MamirriApp"
4. Select "React" as the platform

**Step 2: Install Sentry SDK**

```bash
# In your React frontend
npm install @sentry/react @sentry/browser
```

**Step 3: Initialize Sentry**

Add to your main entry file (e.g., `main.tsx` or `App.tsx`):

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% in dev, reduce in production
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
});
```

**Step 4: Add Error Boundary**

```typescript
// components/ErrorBoundary.tsx
import * as Sentry from '@sentry/react';

const FallbackComponent = () => (
  <div className="p-4 text-center">
    <h2>Something went wrong</h2>
    <p>Our team has been notified. Please refresh the page.</p>
    <button onClick={() => window.location.reload()}>
      Refresh Page
    </button>
  </div>
);

export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }) => children,
  {
    fallback: FallbackComponent,
    showDialog: true,
  }
);
```

**Step 5: Wrap Your App**

```typescript
// main.tsx
import { SentryErrorBoundary } from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <SentryErrorBoundary>
    <App />
  </SentryErrorBoundary>
);
```

**Step 6: Remove Existing Log Attempts**

Find and remove the client-side code trying to send logs to your non-existent API:

```typescript
// Look for and remove code like this:
fetch('/api/logs', {
  method: 'POST',
  body: JSON.stringify(error),
});
```

Replace with Sentry:

```typescript
Sentry.captureException(error);
```

**Step 7: Backend Error Tracking (Optional)**

For your NestJS backend:

```bash
npm install @sentry/nestjs
```

```typescript
// main.ts
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN_HERE',
  integrations: [Sentry.prismaIntegration()],
  tracesSampleRate: 1.0,
});
```

**Time Required:** 15-30 minutes

---

### Phase 2: Configure Alerts (This Week)

Set up notifications so you know when errors happen:

1. **Slack Integration** (if you use Slack)
2. **Email Alerts** for critical errors
3. **Set up alerts for:**
   - New error types
   - Error spikes (>10 errors in 5 minutes)
   - Critical errors (500 status codes)

---

### Phase 3: Privacy Compliance Review (Next Sprint)

Given your clinical app and privacy-first mission:

**Immediate Actions:**

1. Review Sentry's data processing agreement
2. Consider PII scrubbing:

```typescript
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
    }
    return event;
  },
});
```

**Future Evaluation:**

- Monitor if 5,000 errors/month is sufficient as you scale
- Consider migrating to GlitchTip when you have resources for self-hosting
- Evaluate compliance requirements (HIPAA, GDPR for clinical data)

---

## Privacy Considerations for Clinical Apps

**Current Risk with Sentry:**

- Error data stored on US servers
- May include stack traces with file paths
- Could capture user IDs or session data

**Mitigation Strategies:**

1. **Scrub PII** - Configure Sentry to remove sensitive fields
2. **Local Logging** - Keep detailed logs locally for compliance
3. **Minimal Context** - Only send essential error information
4. **Future Migration** - Plan to move to GlitchTip self-hosted when compliance requires

**Recommendation:**
For MVP stage with minimal users, Sentry is acceptable with proper PII scrubbing. For production clinical use with patient data, plan a migration to self-hosted GlitchTip within 6-12 months.

---

## Cost Analysis for Future Planning

| Stage      | Expected Errors/Month | Recommended Solution         | Monthly Cost |
| ---------- | --------------------- | ---------------------------- | ------------ |
| MVP (now)  | < 5,000               | Sentry Free                  | $0           |
| Growth     | 5,000-50,000          | Sentry Team                  | $26-100      |
| Scale      | 50,000+               | GlitchTip Self-hosted        | $5-20 VPS    |
| Enterprise | 500,000+              | Sentry Business or GlitchTip | $100-300     |

---

## Action Items

### Immediate (Today)

- [ ] Sign up for Sentry free account
- [ ] Install Sentry SDK in React frontend
- [ ] Remove existing broken log-to-API code
- [ ] Test error reporting in development
- [ ] Deploy to production
- [ ] Trigger a test error to verify it works

### This Week

- [ ] Configure Slack/email alerts
- [ ] Add PII scrubbing configuration
- [ ] Document error monitoring in your runbook
- [ ] Review first production errors

### Next Sprint

- [ ] Evaluate privacy compliance requirements
- [ ] Consider adding backend error tracking
- [ ] Review error patterns and fix top issues
- [ ] Plan GlitchTip evaluation for future

---

## Why Not the Other Options?

**Datadog:** No free tier for error monitoring. Starts at $15/host/month.

**LiveSession:** Session replay tool, not error monitoring. Expensive.

**LogRocket:** Similar to Highlight.io but more expensive. Starts at $69/month.

**New Relic/Dynatrace:** Enterprise tools, overkill for MVP, expensive.

**CloudWatch (AWS):** Good for infrastructure, poor for application errors.

---

## Conclusion

**Use Sentry Free Tier Now.**

It's the fastest path to production error visibility, requires zero infrastructure, and will immediately solve your "flying blind" problem. The 5,000 error limit is sufficient for your MVP stage.

**Plan for the future:** Keep GlitchTip in mind as a privacy-first, self-hosted alternative when you have the resources to manage infrastructure or when compliance requirements demand it.

**Don't build your own.** It's not your competitive advantage and will consume valuable product development time.

---

## Questions for You

Before implementing, please clarify:

1. **How many users do you expect in the next 3 months?** (This affects error volume estimates)

2. **Do you have any compliance requirements?** (HIPAA, GDPR - this affects the privacy decision)

3. **Do you want session replay?** (Seeing what users did before the error - available in Sentry free tier with limited sessions)

4. **Are you comfortable with US-hosted error data for now?** (Or do we need to explore EU-hosted alternatives?)

5. **Do you already have the client-side error code that needs to be removed/replaced?** (Can you point me to the file?)

Once you confirm these details, I can help you implement the exact solution that fits your needs.

---

_Analysis completed: February 2, 2026_
_Based on 2025 best practices and current free tier offerings_
