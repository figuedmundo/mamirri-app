# Specification: Responsive Design for Mobile/Tablet

## Goal

Make the clinical application fully functional and touch-friendly across tablet (primary) and phone (secondary) devices, enabling the physiotherapist to complete patient sessions on any device, including portable sessions during home visits.

## User Stories

- As a physiotherapist, I want to use the app on my tablet during in-office sessions so that I can record evaluations without leaving my patient's side
- As a physiotherapist, I want to use the app on my phone during home visits so that I can still access and update patient records when I don't have my tablet
- As a physiotherapist, I want all buttons and controls to be easy to tap so that I can quickly navigate without fumbling during a session

## Specific Requirements

**Create useMediaQuery and useBreakpoint Hooks**

- Create `apps/client/src/hooks/use-media-query.ts` for JS-level responsive logic
- Implement SSR-safe hook that returns boolean for media query match
- Create `useBreakpoint` wrapper that returns named breakpoints: `phone`, `tablet`, `desktop`
- Follow existing hook patterns in `apps/client/src/hooks/`
- Export from hooks index for easy imports

**Install and Configure Shadcn Sheet Component**

- Run `npx shadcn@latest add sheet` to add the drawer/sheet component
- Sheet will be used for mobile navigation drawer on CaseTimeline
- Configure with `side="left"` for tablet, consider `side="bottom"` for phone
- Ensure proper z-index layering with existing dialogs

**Responsive CaseDetailLayout Header**

- Convert fixed header toolbar to wrap on smaller screens
- Hide button text on phone, show icons only (`hidden sm:inline` pattern)
- Ensure back button and primary action remain accessible
- Minimum touch target 48px for all header buttons

**Convert CaseTimeline to Responsive Drawer**

- On desktop (lg+): Keep persistent sidebar at `w-80`
- On tablet/phone (<lg): Convert to Sheet component triggered by toggle button
- Add floating toggle button visible on mobile/tablet
- Preserve all existing timeline functionality within Sheet
- Sheet should be dismissible by clicking outside or swipe

**Responsive EvaluationForm Layout**

- Stack orthopedic tests to single column on phone (`grid-cols-1` on <md)
- Increase tab touch targets to minimum 48px height
- Horizontal scroll tabs on overflow with `overflow-x-auto`
- Pain scale slider thumb must be 44px+ for touch

**Enlarge BodySilhouette Touch Targets**

- Increase anatomical point hit areas to 44px minimum
- Consider adding invisible expanded touch areas around visible points
- Scale SVG appropriately on different screen sizes
- Maintain aspect ratio with responsive container

**Touch-Friendly PatientList Actions**

- Replace hover-only card actions with always-visible approach on touch devices
- Option A: Show action buttons persistently on mobile
- Option B: Use dropdown menu triggered by kebab icon
- Ensure 48px minimum touch targets on all action buttons

**Responsive Grid Layouts Throughout**

- PatientList: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Dashboard cards: `grid-cols-1 md:grid-cols-2`
- EvaluationForm sections: Single column on phone, multi-column on tablet+
- Maintain consistent gap spacing that scales: `gap-4 md:gap-6`

**Responsive Container Padding**

- Update AppShell main padding: `p-4 sm:p-6 lg:p-8`
- Ensure content doesn't touch screen edges on phone
- Add safe area padding for notched devices: `pb-safe` or equivalent

**Basic Offline Indicator**

- Add connection status indicator in AppShell header
- Show "Sin conexion" with WifiOff icon when offline
- Hide text on phone, show icon only
- Non-blocking, informational only (full PWA in Week 8)

## Visual Design

No visual mockups provided. Follow existing design patterns in codebase with responsive adaptations. Maintain current color scheme, typography, and component styling.

## Existing Code to Leverage

**MainNav Mobile Menu Pattern**

- Located at `apps/client/src/components/shell/MainNav.tsx`
- Uses `md:hidden` toggle button with hamburger/X icons
- Fixed overlay backdrop with onClick dismiss
- Replicate this pattern for CaseTimeline drawer trigger

**PatientList Responsive Grid**

- Located at `apps/client/src/components/patients/PatientList.tsx`
- Uses `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- Horizontal scroll filters with `overflow-x-auto`
- Apply similar patterns to other list/grid views

**Existing Hooks Structure**

- Located at `apps/client/src/hooks/`
- Follow patterns from `use-debounce.ts` and `use-toast.ts`
- Include corresponding test file for new hooks
- Use standard React hook conventions

**Dialog Component**

- Located at `apps/client/src/components/ui/dialog.tsx`
- Uses Radix UI primitives with Tailwind styling
- Sheet component will follow similar structure
- Reference for z-index and overlay patterns

**Toast Responsive Pattern**

- Located at `apps/client/src/components/ui/toast.tsx`
- Already responsive with different positions on mobile vs desktop
- Reference for conditional positioning based on viewport

## Out of Scope

- Gesture navigation (swipe to go back, pull-to-refresh)
- React Native or native mobile app behaviors
- Voice UI integration (scheduled for Week 7)
- Camera and media capture UI (scheduled for Week 7)
- 3D Plantillas editor on phone (desktop/tablet only, Part 3)
- Complex chart visualizations on phone (show "View on tablet" message)
- Full offline data sync with IndexedDB (scheduled for Week 8 PWA)
- Print layouts and print stylesheets (PDF export handles this)
- Landscape-specific layouts that differ from portrait (support both, same layout adapts)
- Custom breakpoints beyond Tailwind defaults (use sm/md/lg/xl/2xl)
