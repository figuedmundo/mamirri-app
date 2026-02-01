# Task Breakdown: PWA Manifest & App Identity

## Overview

Total Tasks: 4

## Task List

### Assets & Design

#### Task Group 1: Brand Assets & Icons

**Dependencies:** None

- [x] 1.0 Create Brand & App Icons
  - [x] 1.1 Design "Mamirri" Logo (SVG)
    - Create `apps/client/src/assets/logo.svg`
    - Style: Clean, medical, friendly (use Nano Banana Pro)
    - Primary Color: `#2d9f8e`
  - [x] 1.2 Generate Icon Set
    - Generate `apps/client/public/favicon.ico` (32x32)
    - Generate `apps/client/public/icon-192.png` (192x192)
    - Generate `apps/client/public/icon-512.png` (512x512)
    - Generate `apps/client/public/apple-touch-icon.png` (180x180, non-transparent bg)
    - Generate `apps/client/public/maskable-icon.png` (512x512, with padding)
  - [x] 1.3 Create Android Richer Install UI Assets
    - Generate `apps/client/public/screenshot-wide.png` (1280x720, placeholder art)
    - Generate `apps/client/public/screenshot-narrow.png` (720x1280, placeholder art)
  - [x] 1.4 Verify Asset Presence
    - Check all files exist in `apps/client/public/`

**Acceptance Criteria:**

- All 7 image assets exist in `apps/client/public/`
- Logo uses correct primary color
- `apple-touch-icon.png` has no transparency (to avoid black background on iOS)

### Configuration & Implementation

#### Task Group 2: Manifest & HTML Config

**Dependencies:** Task Group 1

- [x] 2.0 Implement PWA Configuration
  - [x] 2.1 Create `apps/client/public/manifest.json`
    - Define name, short_name, start_url, display, orientation
    - Set theme_color and background_color to `#2d9f8e`
    - Configure icons array (standard + maskable)
    - Configure screenshots array (wide + narrow)
    - Define categories and description
  - [x] 2.2 Update `apps/client/index.html`
    - Add iOS meta tags (capable, status-bar, title)
    - Link `apple-touch-icon`
    - Link `manifest.json`
    - Set `theme-color` meta tag
  - [x] 2.3 Verify Service Worker Asset Caching
    - Update `apps/client/public/sw.js` to ensure new assets are cached (or handled by existing wildcard)
  - [x] 2.4 Test PWA Installability (Manual/Audit)
    - Verify Chrome DevTools > Application > Manifest shows no errors
    - Verify "Install capability" in Lighthouse

**Acceptance Criteria:**

- `manifest.json` is valid and linked
- iOS meta tags are present in `index.html`
- Lighthouse PWA audit recognizes installability

### Testing

#### Task Group 3: Verification

**Dependencies:** Task Group 2

- [x] 3.0 Verify PWA Implementation
  - [x] 3.1 Verify Manifest Loading
    - Browser fetches `manifest.json` correctly
  - [x] 3.2 Verify Icon Recognition
    - Browser recognizes all icon sizes
  - [x] 3.3 Verify iOS specific tags
    - Inspect DOM for apple-mobile-web-app tags

**Acceptance Criteria:**

- No console errors related to manifest
- Manifest loads with status 200

## Execution Order

1. Brand Assets & Icons (Task Group 1)
2. Manifest & HTML Config (Task Group 2)
3. Verification (Task Group 3)
