# Spec Requirements: PWA Manifest

## Initial Description

PWA manifest (install to home screen) - Task 8.3 from roadmap.
Goal: Complete and thorough planning document, focusing on latest best practices (2025) for iPadOS and Android tablets.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the `name` should be "Mamirri" and `short_name` (for home screen) "Mamirri". Is that correct?
**Answer:** (Implicit "Yes" based on lack of correction)

**Q2:** I see `apps/client/public/vite.svg` currently. Do you have a specific Mamirri logo?
**Answer:** "create a logo you can use nano banana pro, be creative"

**Q3:** What primary color code (Hex) should we use?
**Answer:** "suggest" (Will use primary color from Tailwind config converted to Hex)

**Q4:** Scope: Should I also create the "Screenshots" assets required for the "Richer Install UI"?
**Answer:** "please create the needed arts using nano banana pro" + "the main target is also for android tablets, please be more complete"

### Existing Code to Reference

No similar existing features identified for reference.

### Follow-up Questions

**Follow-up 1:** Icon Assets - Should I create a placeholder SVG logo?
**Answer:** "create a logo you can use nano banana pro, be creative"

**Follow-up 2:** Screenshots for Richer Install UI - Should I skip or generate placeholders?
**Answer:** "please create the needed arts using nano banana pro"

**Follow-up 3:** Theme Color - Is the converted Hex acceptable?
**Answer:** "suggest"

## Visual Assets

### Files Provided:

No visual files found.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Manifest File**: Create a complete `manifest.json` at `apps/client/public/manifest.json`.
- **Icon Generation**: Create a creative SVG logo ("Mamirri") using the `frontend-design` skill (simulated "nano banana pro").
- **Asset Generation**: Generate all required icon sizes (192, 512, apple-touch-icon, maskable).
- **Richer Install UI Assets**: Generate placeholder "screenshot" images (wide and narrow) to enable the Android Richer Install UI.
- **Meta Tags**: Add comprehensive iOS and Android meta tags to `apps/client/index.html`.
- **Service Worker Update**: Ensure service worker handles the new assets correctly.

### Reusability Opportunities

- None identified.

### Scope Boundaries

**In Scope:**

- `manifest.json` creation with all 2025 standard fields.
- iOS specific configuration (mobile-web-app-capable, status-bar-style, apple-touch-icon).
- Android specific configuration (theme_color, categories, shortcuts, screenshots).
- Asset creation (Logo + Screenshots).
- HTML head updates.

**Out of Scope:**

- Push notifications integration (deferred).
- Native app store packaging (TWA/Cordova).

### Technical Considerations

- **Theme Color**: Convert Tailwind primary `174 56% 40%` to Hex for `theme_color`.
- **Display Mode**: `standalone` for app-like experience.
- **Orientation**: `any` (or `portrait-primary` if preferred, but tablets often use landscape). Defaults to `any` for tablets.
- **Icons**: SVG is preferred for source, but manifest requires PNGs. Will generate PNGs from SVG if possible or just use SVG if supported (modern browsers support SVG in manifest, but iOS often prefers PNG for apple-touch-icon). _Self-correction: Will create SVGs and assume build process or browser handles them, or sticking to standard PNG sizes if tools allow._
