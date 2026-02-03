# Spec Requirements: Improve Login

## Initial Description

Improve login functionality (Task 9.7 from roadmap). Focus on fixing session persistence (currently logging out too quickly), optimizing UX for tablet/touch usage (Mother's iPad), improving error feedback, and ensuring the interface is in Spanish.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the primary "improvement" needed is **session persistence** (she gets logged out too often). Should we implement a "Remember Me" checkbox or simply increase the default session duration (e.g., to 7 days) to reduce login frequency?
**Answer:** yes session persistence, I dont know if a rembmer me is good idea, that botton si somethign I dont see now ofter, but I know the jwt is for 7 days, why are we loggged out after 5 min not use ?

**Q2:** I assume we should **optimize the UI for tablet/touch** usage. Should we increase input sizes, button heights, and font readability specifically for the iPad viewport?
**Answer:** yes optmize for tablet touce usage

**Q3:** I'm thinking we should improve **error feedback**. Currently, does the app provide clear, friendly messages when login fails (e.g., "Incorrect password" vs. generic errors), and should we refine this?
**Answer:** yes agree

**Q4:** Are we sticking to **Email/Password** authentication, or should we consider adding a simplified **PIN code** (e.g., 4 digits) for quick re-entry after the initial login?
**Answer:** email password is good for now

**Q5:** Is the **"Forgot Password" / Password Reset** flow in scope for this specific task, or should that be a separate item?
**Answer:** forgot passowrd will be for future

**Q6:** Are there any specific performance issues with login (e.g., slow response time) that need addressing, or is this purely functional/UX?
**Answer:** is we can improve performance would be great , we need to improve the funtional/UX and make it in spanish

### Existing Code to Reference

User did not provide specific paths, but the existing login implementation is the primary reference.

- Likely location: `apps/client/src/pages/Login.tsx` or similar.
- Auth logic: `apps/client/src/context/AuthContext.tsx` or similar.

### Follow-up Questions

None required. The "5-minute logout" issue is identified as a bug to be fixed during implementation.

## Visual Assets

### Files Provided:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Session Persistence (Bug Fix):** Investigate and fix the issue causing logout after ~5 minutes of inactivity, ensuring the intended 7-day session duration works correctly.
- **Authentication:** Keep Email/Password flow.
- **Localization:** Translate all login screen text (labels, placeholders, buttons, errors) into **Spanish**.
- **Error Handling:** Display clear, friendly error messages in Spanish (e.g., "Contraseña incorrecta" instead of generic failures).

### UX & UI Improvements

- **Tablet Optimization (iPad):**
  - Increase touch target sizes for inputs and buttons (min 44px height).
  - Improve font readability (larger sizes).
  - Ensure layout works well in both portrait and landscape modes on tablet.
- **Performance:** Optimize load time and interaction response where possible.

### Reusability Opportunities

- Reuse existing `Button` and `Input` components from `packages/ui` (Shadcn/UI), potentially creating "Large" variants if they don't exist.
- Reuse existing Auth context/hooks.

### Scope Boundaries

**In Scope:**

- Login page UI overhaul (Tablet optimized, Spanish).
- Fixing session timeout bug.
- Improving error messages.

**Out of Scope:**

- "Forgot Password" flow.
- PIN code login.
- "Remember Me" checkbox (user prefers automatic persistence).
- Registration page updates (unless shared components require it).

### Technical Considerations

- **JWT Config:** Check backend `JwtModule` configuration and frontend token storage/interceptor logic to resolve the 5-minute timeout.
- **Tech Stack:** React, TailwindCSS, Shadcn/UI (existing).
