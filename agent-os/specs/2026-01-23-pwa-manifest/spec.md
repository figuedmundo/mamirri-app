# Specification: PWA Manifest & App Identity

## Goal

Enable "Add to Home Screen" functionality for iPadOS (primary target) and Android Tablets, providing a native-app-like experience with a custom "Mamirri" identity, splash screens, and rich install UI support.

## User Stories

- As a Physiotherapist (Mother), I want to install "Mamirri" to my iPad home screen so that it looks and feels like a real app without browser bars.
- As a user on an Android tablet, I want to see a rich installation dialog with screenshots so that I trust the app before installing.
- As a user, I want to see a distinct "Mamirri" icon on my home screen so that I can easily find and launch the app.

## Specific Requirements

**Manifest Configuration**

- Create `apps/client/public/manifest.json` with standard PWA fields (name, short_name, start_url, display: standalone).
- Configure `theme_color` (#2d9f8e) and `background_color` (#2d9f8e) matching the brand identity.
- Set `orientation` to `any` to support both portrait and landscape use on tablets.
- Define `categories` ("medical", "productivity") and `description` for store-like listings.

**App Identity & Assets (Creative)**

- Design and create a new "Mamirri" logo (SVG) using a creative "Nano Banana Pro" style (clean, medical, friendly).
- Generate required icon set:
  - `favicon.ico` (32x32)
  - `icon-192.png` (192x192) - Android Home Screen
  - `icon-512.png` (512x512) - Android Splash / Store
  - `apple-touch-icon.png` (180x180) - iOS Home Screen (non-transparent background to prevent black artifacts).
  - `maskable-icon.png` (512x512) - Android Adaptive Icon.

**Android Richer Install UI Support**

- Create placeholder "screenshot" assets to enable the Richer Install UI on Android.
  - `screenshot-wide.png` (1280x720) - Form factor: wide.
  - `screenshot-narrow.png` (720x1280) - Form factor: narrow.
- Add `screenshots` array to `manifest.json` referencing these assets.

**iOS/iPadOS Optimization**

- Update `apps/client/index.html` with iOS-specific meta tags:
  - `<meta name="apple-mobile-web-app-capable" content="yes">`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
  - `<meta name="apple-mobile-web-app-title" content="Mamirri">`
  - `<link rel="apple-touch-icon" ...>`

**Service Worker Updates**

- Verify `apps/client/public/sw.js` precaches the new icon assets (or explicitly excludes them if strategy requires, usually good to cache core icons).

## Visual Design

[No mockups provided. Creative freedom granted for Logo and Placeholder Screenshots.]

## Existing Code to Leverage

**Service Worker (`apps/client/public/sw.js`)**

- Use the existing service worker infrastructure to handle asset caching.
- Ensure the manifest file itself is handled correctly (usually network-first or stale-while-revalidate).

**Theme Configuration (`apps/client/tailwind.config.js`)**

- Use the existing Primary Color (`174 56% 40%` -> `#2d9f8e`) as the source of truth for `theme_color`.

## Out of Scope

- Push Notification integration.
- Full "Offline Mode" logic (Task 8.4) - only asset presence is required here.
- Native App Store packaging (TWA, IPA).
- Real screenshots of the actual app UI (Placeholders are sufficient for this tech task).
