# Spec Requirements: Responsive Design for Mobile/Tablet

## Initial Description

From roadmap task 6.12: Implement responsive design for mobile/tablet to ensure the clinical application works seamlessly across all device sizes, with primary focus on tablet (iPad/Android) and secondary support for phone (for home visits and portable sessions).

## Requirements Discussion

### First Round Questions

**Q1:** Primary device target - iPad as primary or also smartphone support?
**Answer:** Android tablet is the current device, with iPad planned for future. User realized phone support would enable portable sessions during home visits. Decision: **Tablet-first, phone-capable** approach.

**Q2:** Priority order for component updates?
**Answer:** User requested recommendations. Decision: Follow clinical workflow priority:

1. CaseDetailLayout + CaseTimeline (core session workflow)
2. EvaluationForm + BodySilhouette (data entry)
3. PatientList + PatientProfile (navigation)
4. ComparisonBoard + PosturogramViewer (visual comparison)
5. TreatmentTimeline + Charts (progress tracking)

**Q3:** Sidebar behavior on tablet - drawer or persistent?
**Answer:** User requested recommendations. Decision: **Smart contextual drawer**:

- Phone (<768px): Full-screen bottom/left drawer, hidden by default
- Tablet portrait (768-1024px): Left drawer (70% width), overlay mode
- Tablet landscape / Desktop (1024px+): Persistent sidebar

**Q4:** Touch target sizes?
**Answer:** User requested recommendations. Decision: **48px minimum, 56px for primary actions**:

- Icon buttons: 48px × 48px
- Primary actions: 56px height
- List items/Cards: 56px+ height
- Form inputs: 48px height
- BodySilhouette touch points: 44px with expanded hit area

**Q5:** Orientation support (landscape vs portrait)?
**Answer:** User requested recommendations. Decision: **Support both with adaptive layouts**:

- No orientation restrictions
- CaseDetailLayout: Stacked in portrait, side-by-side in landscape
- ComparisonBoard: Vertical stack in portrait, side-by-side in landscape
- PatientList: 1 column portrait, 2-3 columns landscape

**Q6:** Offline indicator inclusion?
**Answer:** User requested recommendations. Decision: **Include basic indicator now, defer full PWA to Week 8**:

- Simple "Sin conexión" indicator in header when offline
- Full IndexedDB sync and background sync in Week 8

**Q7:** What should be excluded from scope?
**Answer:** User requested recommendations. Exclusions:

- Gesture navigation (swipe back, pull-to-refresh)
- Native app behaviors (React Native deferred to Part 4)
- Voice UI integration (Week 7 scope)
- Camera/media capture UI (Week 7 scope)
- 3D Plantillas on mobile (desktop/tablet only)
- Complex charts on phone (show "View on tablet" message)
- Print layouts (PDF export already handles this)

### Existing Code to Reference

**Similar Features Identified:**

- MainNav already implements mobile hamburger menu pattern at `md:` breakpoint
- Shadcn/UI Sheet component available for drawer implementation
- PatientList uses responsive grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`)
- EvaluationForm tabs use `overflow-x-auto` for horizontal scrolling

**Components Needing Updates (from codebase analysis):**

- `apps/client/src/components/shell/AppShell.tsx` - Responsive padding
- `apps/client/src/components/shell/MainNav.tsx` - Already has mobile menu, needs safe area testing
- `apps/client/src/components/patients/CaseDetailLayout.tsx` - Desktop-first, needs mobile adaptation
- `apps/client/src/components/patients/CaseTimeline.tsx` - Fixed w-80, needs drawer conversion
- `apps/client/src/components/patients/EvaluationForm.tsx` - Complex grids need stacking
- `apps/client/src/components/patients/BodySilhouette.tsx` - Fixed 250px, needs larger touch targets
- `apps/client/src/components/patients/PatientList.tsx` - Hover-based actions need touch alternatives

**Gap Identified:**

- No `useMediaQuery` or `useBreakpoint` hook exists for JS-level responsive logic
- Need to create `apps/client/src/hooks/use-media-query.ts`

### Follow-up Questions

No follow-up questions required - user accepted all recommendations.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - Development will follow existing design patterns in codebase with responsive adaptations.

## Requirements Summary

### Functional Requirements

**Device Support:**

- Tablet Portrait (768px - 1024px): PRIMARY target
- Tablet Landscape (1024px+): PRIMARY target
- Phone (<640px): SECONDARY target (fully functional)
- Desktop (1280px+): TERTIARY (already works)

**Breakpoint Strategy:**

```
sm: 640px   → Phone landscape / small tablet
md: 768px   → Tablet portrait (Android/iPad mini) - MOBILE→TABLET transition
lg: 1024px  → Tablet landscape / iPad portrait - TABLET→DESKTOP transition
xl: 1280px  → Desktop / large tablet landscape
```

**Navigation:**

- Persistent sidebar on desktop (lg+)
- Slide-out drawer on tablet portrait (md-lg)
- Full-screen drawer on phone (<md)
- Toggle button always visible on mobile/tablet

**Touch Interactions:**

- All buttons minimum 48px touch target
- Primary actions 56px height
- Card actions always visible (not hover-dependent)
- Adequate spacing between touch targets (12px minimum)

**Layout Adaptations:**

- Forms stack to single column on phone
- Grids reduce columns on smaller screens
- Tabs scroll horizontally when needed
- Complex visualizations show "View on tablet" on phone

**Offline Awareness:**

- Basic connection status indicator in header
- Visual feedback when offline

### Reusability Opportunities

**Existing Patterns to Follow:**

- `MainNav` mobile menu implementation
- `PatientList` responsive grid pattern
- Shadcn/UI Sheet component for drawers
- Shadcn/UI responsive dialog patterns

**New Utilities to Create:**

- `useMediaQuery` hook for JS-level responsive logic
- `useBreakpoint` hook for named breakpoint detection
- Responsive container component with standardized padding

**External Patterns to Apply (from research):**

- Shadcn Sidebar component with `useSidebar` hook
- Card view pattern for mobile data tables
- Touch-friendly button sizing patterns
- Medical app accessibility patterns (WCAG AAA touch targets)

### Scope Boundaries

**In Scope:**

- All navigation works on all devices
- All forms are usable on all devices
- Core workflow (patient → case → session → evaluation) works on phone
- Touch-friendly interactions everywhere
- Readable typography at all sizes
- Responsive padding and spacing
- Drawer/sheet navigation on mobile
- Basic offline indicator
- Orientation support (portrait + landscape)

**Out of Scope:**

- Gesture navigation (swipe to go back, pull-to-refresh)
- Native app behaviors (React Native)
- Voice UI integration (Week 7)
- Camera/media capture UI (Week 7)
- 3D Plantillas on mobile (Part 3, desktop/tablet only)
- Complex charts on phone (simplified or deferred)
- Print layouts (already handled by PDF export)
- Full offline sync (Week 8 PWA scope)

### Technical Considerations

**Tech Stack:**

- Tailwind CSS responsive utilities (mobile-first)
- Shadcn/UI components (Sheet, Dialog, Drawer)
- React hooks for JS-level responsive logic
- No additional dependencies required

**Implementation Approach:**

- Mobile-first CSS (base styles for mobile, enhance with breakpoints)
- Progressive enhancement (core functionality on all devices)
- Touch-first interactions (no hover-only functionality)

**Testing Requirements:**

- Test on actual Android tablet
- Test on phone (both portrait and landscape)
- Test on iPad simulator
- Test touch interactions (no hover states as sole affordance)

**Performance Considerations:**

- Avoid layout shifts on resize
- Lazy load heavy components on mobile
- Consider reduced motion preferences

**Accessibility:**

- Touch targets meet WCAG AAA (44px minimum)
- Focus states visible on all devices
- Screen reader compatibility maintained
- Safe area support for notched devices

## Implementation Phases

### Phase 1: Foundation & CaseDetailLayout (Highest Priority)

1. Create `useMediaQuery` and `useBreakpoint` hooks
2. Update `AppShell` with responsive padding
3. Convert `CaseTimeline` to Sheet/drawer on mobile
4. Make `CaseDetailLayout` header responsive
5. Test on tablet and phone

### Phase 2: EvaluationForm & BodySilhouette

1. Stack orthopedic tests grid on mobile
2. Increase `BodySilhouette` touch targets
3. Make tabs touch-friendly with scroll
4. Responsive pain scale slider
5. Test form completion on phone

### Phase 3: PatientList & PatientProfile

1. Convert hover actions to always-visible or menu
2. Ensure card touch targets are adequate
3. Responsive filters with horizontal scroll
4. Test patient navigation flow

### Phase 4: ComparisonBoard & Visualizations

1. Vertical stacking on phone
2. "View on tablet" for complex charts
3. Responsive image comparison slider
4. Test comparison workflow

### Phase 5: Polish & Testing

1. Add offline indicator
2. Safe area padding for notched devices
3. Cross-device testing
4. Performance optimization
