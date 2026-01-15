# Spec Requirements: ComparacionBoard Enhancement

## Initial Description

From roadmap task 6.3: "ComparacionBoard — Before/After visual comparison slider"

The existing `ComparisonBoard` component shows side-by-side comparison cards for footprints, posture, and clinical tests. This spec aims to add an interactive slider-based before/after comparison mode for visual media.

## Requirements Discussion

### First Round Questions

**Q1:** Should slider replace existing side-by-side view, or should we offer both view modes (toggle between them)?

**Answer:** Both modes with a toggle button. Slider excels at subtle visual comparisons (arch height changes, posture alignment shifts), while side-by-side better shows context, date labels, and analysis data simultaneously. Different clinical scenarios benefit from different modes. Quick patient demonstration uses slider; detailed clinical review uses side-by-side. Toggle button in action bar: "Slider ⇄ Split View".

**Q2:** Should we extract the slider pattern from `PosturogramViewer.tsx` into a reusable `BeforeAfterSlider` component that both components can share?

**Answer:** Yes, extract to reusable component. Follows DRY principle. PosturogramViewer.tsx already has working slider logic (drag handling, clipping, positioning). Future-proof - Análisis module (Weeks 19-22) will need comparison for Huella analysis, additional posturogram views, and gait video frames. Ensures consistency across entire app. Test component once, apply everywhere.

**Q3:** For which tabs should slider be available? I'm thinking "Huellas Plantares" and "Análisis Postural" tabs would benefit from slider comparison, but "Datos Clínicos" (tabular data) wouldn't. Is that correct?

**Answer:** Slider for "Huellas Plantares" (Footprints) and posture images only in "Análisis Postural". Tabular data in "Datos Clínicos" doesn't apply to visual slider.

**Q4:** For posture videos, should we support slider comparison by showing initial and final video with the same slider handle position determining which video is visible, or should we keep videos side-by-side since they have duration/playback controls?

**Answer:** Side-by-side for videos. Video complexity with play/pause, progress bar, volume controls, and scrubbing makes slider implementation complex and UX-confusing. Clinicians want independent playback of initial and final videos. Videos remain in side-by-side cards regardless of mode toggle. Slider applies to static images only.

**Q5:** For slider handle design, I'm assuming a circular drag handle with left/right arrows (similar to the existing `PosturogramViewer` implementation using the Split icon from lucide-react). Should we enhance this with a knob-style handle or keep it simple?

**Answer:** Keep circular handle with Split icon (lucide-react), but enhance usability. Existing pattern in PosturogramViewer is successful. Circular handle with arrows is standard for image comparison sliders. Split icon is immediately intuitive. Enhancements: Larger touch target (48px diameter for iPad), drop shadow, hover/active scale to 110%, contrast border, semi-transparent background with backdrop blur.

**Q6:** Should there be any animation when the slider reaches extremes (0% or 100%)? For example, a pulse effect or subtle glow to indicate you're fully on one image or the other?

**Answer:** Yes, subtle pulse animation at 0% and 100%. Clear feedback that users have reached the limit of slider movement. Modern UI pattern used in comparison sliders. Subtle UX enhancement, not distracting. Helps users with motor control issues confirm position. 2-second pulse cycle using Tailwind animate-pulse. 0-5% pulses on "After" image side, 95-100% pulses on "Before" image side.

**Q7:** Should the `onExport` and `onShare` callbacks remain unchanged, or should they export the current slider view (e.g., a screenshot of the slider at its current position)?

**Answer:** Keep `onExport` unchanged - export full comparison report, not slider screenshot. Slider screenshot at arbitrary position is not useful for patient records. Full report with both initial/final images, metrics, analysis, and progress summary is more clinically valuable. Consistent with existing onExport behavior. If users want to capture specific slider position, they can use OS screenshot tools.

**Q8:** Is there anything explicitly out of scope that we should NOT include in this task? For example, we're assuming no new backend endpoints, no changes to the database schema, and no AI-powered automatic comparison features.

**Answer:** Out of scope includes: New backend endpoints or API modifications, database schema changes (Prisma migrations), AI-powered automatic comparison or analysis (deferred to Part 2: AI Infrastructure, Week 14-15), new media capture functionality (camera, video recording - deferred to Week 7), changes to PosturogramViewer component (already has slider), image alignment or homography (deferred to Análisis module, Week 20-22), multi-image comparison (comparing 3+ evaluations - only before/after), 3D comparison or overlay (deferred to Plantillas 3D CAD, Week 23-28), video synchronization or frame-by-frame comparison (keep videos side-by-side), undo/redo for slider position, annotate/draw on images during comparison, save slider position to database. In scope: Frontend UI changes only, extract `BeforeAfterSlider` reusable component, add toggle for slider vs side-by-side mode, apply slider to footprint images and posture photos (not videos), enhance slider handle for better usability, add subtle animation at extremes, maintain all existing functionality (tabs, export, share), TypeScript type safety, touch/mouse support, dark mode compatibility.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: PosturogramViewer - Path: `apps/client/src/components/patients/PosturogramViewer.tsx`
- Components to potentially reuse: The existing slider implementation with mouse/touch drag handling, clipping logic, and handle positioning
- Backend logic to reference: None - this is purely a frontend UI enhancement

**Similar Features Identified:**

- Feature: ComparisonBoard (existing side-by-side) - Path: `apps/client/src/components/patients/ComparisonBoard.tsx`
- Components to potentially reuse: Tab navigation pattern, card styling, date display, export/share callbacks, clinical metrics table
- Backend logic to reference: Data structure for footprints, postureVideos, and evaluation comparisons

**Similar Features Identified:**

- Feature: MediaGallery - Path: `apps/client/src/components/patients/MediaGallery.tsx`
- Components to potentially reuse: Image/video rendering patterns, hover states, media item structure
- Backend logic to reference: None

### Follow-up Questions

None - all questions answered with confirmed recommendations.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

None - no visuals provided. Design will follow existing patterns from PosturogramViewer and ComparisonBoard.

## Requirements Summary

### Functional Requirements

- **Toggle-able comparison modes:** Add toggle button to switch between slider mode and side-by-side view
- **Slider for footprints:** Enable interactive before/after slider comparison for footprint images in "Huellas Plantares" tab
- **Slider for posture photos:** Enable interactive slider for static posture photos in "Análisis Postural" tab
- **Side-by-side for videos:** Videos remain in side-by-side view regardless of mode toggle
- **Reusable slider component:** Extract `BeforeAfterSlider` component from PosturogramViewer implementation
- **Enhanced slider handle:** Circular handle with Split icon, 48px touch target, drop shadow, hover/active scale effect, contrast border, semi-transparent background
- **Extreme position animation:** Subtle pulse animation when slider reaches 0-5% or 95-100%
- **Maintain existing functionality:** All tabs, export, share, clinical metrics table, and data display remain unchanged

### Reusability Opportunities

- Extract `BeforeAfterSlider` component to `apps/client/src/components/ui/BeforeAfterSlider.tsx`
- Reuse PosturogramViewer's drag handling, clipping logic, and positioning patterns
- Leverage ComparisonBoard's tab navigation, card styling, and action bar patterns
- Follow MediaGallery's media rendering patterns for consistency
- Future-proof: Análisis module (Weeks 19-22) can reuse BeforeAfterSlider for Huella analysis, additional posturogram views, gait video frames

### Scope Boundaries

**In Scope:**

- Frontend UI changes only (no backend modifications)
- Extract `BeforeAfterSlider` reusable component from PosturogramViewer pattern
- Add view mode toggle (Slider ⇄ Split View) in action bar
- Apply slider to footprint images in "Huellas Plantares" tab
- Apply slider to posture photos in "Análisis Postural" tab (videos remain side-by-side)
- Enhance slider handle for better usability (48px touch target, enhanced visuals)
- Add subtle pulse animation at slider extremes (0-5%, 95-100%)
- Maintain all existing functionality (tabs, export, share, clinical metrics)
- TypeScript type safety with proper interfaces
- Touch and mouse support for slider drag
- Dark mode compatibility throughout

**Out of Scope:**

- New backend endpoints or API modifications
- Database schema changes or Prisma migrations
- AI-powered automatic comparison or analysis (deferred to Part 2: AI Infrastructure, Week 14-15)
- New media capture functionality (camera, video recording - deferred to Week 7)
- Changes to PosturogramViewer component (it already has working slider)
- Image alignment or homography (deferred to Análisis module, Week 20-22)
- Multi-image comparison (comparing 3+ evaluations - only before/after)
- 3D comparison or overlay (deferred to Plantillas 3D CAD, Week 23-28)
- Video synchronization or frame-by-frame comparison
- Undo/redo for slider position (transient UI state only)
- Annotate or draw on images during comparison
- Save slider position to database
- Canvas-to-image screenshot capture for export

### Technical Considerations

- Integration point: Existing `ComparisonBoard.tsx` component (348 lines)
- Existing system constraints: Uses TailwindCSS, Shadcn/UI, Lucide React icons, TypeScript
- Technology preferences stated: React 19.2, no new external dependencies unless necessary
- Similar code patterns to follow: PosturogramViewer.tsx slider implementation, MediaGallery.tsx media handling, ComparisonBoard.tsx existing patterns
- Touch support: Minimum 44px touch targets, use both mouse and touch events
- Accessibility: Keyboard navigation support for toggle button, ARIA labels for slider interaction
- Performance: Use CSS transforms for handle positioning (hardware acceleration), avoid layout thrashing during drag
- Component extraction: Extract common slider logic to prevent code duplication
