# Spec Requirements: EvaluacionForm Enhancement

## Initial Description

Roadmap Task 6.1: **EvaluacionForm** — Clinical evaluation form with posturograma and orthopedic tests.

This is part of Week 6 (Pacientes — Evaluation & Timeline) in the MVP phase. The goal is to enhance the existing `EvaluationForm.tsx` component to provide a more interactive and complete clinical evaluation experience.

## Requirements Discussion

### First Round Questions

**Q1:** Is this enhancement or replacement? The existing `EvaluationForm.tsx` has basic functionality.
**Answer:** Enhancement. We will build upon the existing ~700-line component rather than rewriting from scratch.

**Q2:** Posturogram interactivity level? Current implementation uses simple dropdowns per body part.
**Answer:** Hybrid approach recommended and accepted:

- Add a **clickable SVG body silhouette** (single anterior view for Week 6)
- Keep dropdown functionality for deviation selection
- Color-coded markers: Green (normal), Amber (mild), Red (severe)
- Full 4-view posturogram is out of scope (Week 20)

**Q3:** Orthopedic tests scope? Current implementation has Thomas, Ely, Ober, Schober tests.
**Answer:** Expand to 8 configurable tests:

- **Keep (4):** Thomas, Ely, Ober, Schober
- **Add (4):** Ott, Patrick (FABER), Lasègue (SLR), Dedo-Suelo
- Architecture should support enabling/disabling tests per evaluation

**Q4:** Backend integration status?
**Answer:** Wire frontend to existing endpoints + gap analysis:

- Connect `onSave` to existing evaluation PATCH endpoint
- Add debounced real-time save for posturogram/pain changes
- Verify endpoints match enhanced form fields
- Document any gaps for backend team (but don't create new modules)

**Q5:** Voice dictation implementation?
**Answer:** UI complete with placeholder for Week 7 integration:

- Build full recording UI (button, waveform, timer, playback)
- Save audio blob locally
- Display "Transcription pending..." placeholder
- Actual Whisper API integration is Week 7 scope

**Q6:** What should we explicitly exclude?
**Answer:** See Scope Boundaries section below.

### Existing Code to Reference

**Similar Features Identified:**

- Feature: EvaluationForm — Path: `apps/client/src/components/patients/EvaluationForm.tsx`
  - Existing base component (~700 lines) with tabbed interface
  - Pain scale sliders, Barthel/Lawton indices, posturogram dropdowns
- Feature: PosturogramaView — Path: `product-plan/sections/analisis/components/PosturogramaView.tsx`
  - Reference for anatomical point visualization pattern
  - 4-view structure (future reference for Week 20)
- Feature: Patient Types — Path: `apps/client/src/types/patient.ts`
  - Complete type definitions for Evaluation, Posturogram, OrthopedicTests, etc.
- Feature: PosturogramViewer — Path: `apps/client/src/components/patients/PosturogramViewer.tsx`
  - Image comparison slider pattern (for reference)
- Feature: PatientForm — Path: `apps/client/src/components/patients/PatientForm.tsx`
  - Manual useState + Zod validation pattern (project standard)

**Backend References:**

- DTOs: `apps/server/src/modules/patients/dto/update-evaluation.dto.ts`
- API Client: `apps/client/src/api/patients.ts`

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A — Development will follow existing component patterns and the design system established in the codebase.

## Requirements Summary

### Functional Requirements

**Posturogram Section (Enhanced):**

- SVG body silhouette (anterior view) with clickable anatomical points
- Points: Head, Shoulders, Spine, Pelvis, Knees, Feet
- Click on point → opens deviation selector (dropdown or modal)
- Visual color coding: 🟢 Normal, 🟡 Mild deviation, 🔴 Severe deviation
- Real-time state updates with debounced backend save
- Fallback to current dropdown UI if SVG interaction fails

**Orthopedic Tests Section (Expanded):**

- 8 configurable tests with enable/disable capability
- Core tests: Thomas, Ely, Ober, Schober (existing)
- New tests: Ott, Patrick (FABER), Lasègue (SLR), Dedo-Suelo
- Each test captures: numeric result, text interpretation, status badge
- Tests defined as configurable array in types for future expansion

**Pain Scale Section (Refinements):**

- Keep existing gradient slider UI (0-10 scale)
- Three measurement contexts: Activity, Rest, Palpation
- Pain type toggle: Chronic / Acute
- Minor polish: accessibility improvements, touch targets for tablet

**AVD Evaluation Section (Existing - No Changes):**

- Barthel Index (10 categories, 0-100 scale)
- Lawton Scale (8 categories, 0-8 scale)
- Automatic total calculation with interpretation

**Voice Dictation UI (New):**

- Recording button with visual feedback (pulse animation)
- Waveform or level meter during recording
- Timer display (recording duration)
- Stop/Cancel controls
- Audio playback before confirming
- Placeholder text field showing "Transcription pending..."
- Audio blob saved locally for Week 7 integration
- `onVoiceDictation` callback fires with audio data

**Backend Integration:**

- Wire `onSave(evaluation)` to PATCH endpoint
- Wire `onPosturogramChange` with debounce (300ms)
- Wire `onPainScaleChange` with debounce (300ms)
- Loading states during save operations
- Error handling with toast notifications
- Optimistic updates with rollback on failure

**Form Behavior:**

- Tab navigation between sections (existing)
- Form validation using Zod (project pattern)
- Cancel button returns to previous view
- Save button disabled until changes detected
- Unsaved changes warning on navigation away

### Reusability Opportunities

- **SVG Body Silhouette:** Could become shared component for future posturogram views
- **Test Configuration Pattern:** Extensible for therapist-defined custom tests
- **Recording UI:** Reusable for anamnesis voice notes, session notes
- **Debounced Save Hook:** Extract as custom hook for other forms

### Scope Boundaries

**In Scope:**

- Enhanced EvaluationForm with visual posturogram selector
- Expanded orthopedic tests (8 tests, configurable architecture)
- Polished pain scale UI (minor accessibility refinements)
- AVD evaluation (Barthel/Lawton — maintain existing)
- Voice dictation UI (complete recording interface)
- Backend API wiring for save operations
- Loading states, error handling, validation feedback
- Mobile/tablet responsive refinements
- Form state management improvements

**Out of Scope:**
| Feature | Reason | Roadmap Location |
|---------|--------|------------------|
| Before/After Comparison Slider | Separate component (ComparacionBoard) | Task 6.3, Week 6 |
| 4-View Posturogram Capture | Full posturogram is Análisis module | Week 20 |
| Footprint (Huella) Analysis | Análisis module | Week 19 |
| Video Capture/Analysis | Media & Dictation module | Week 7 + Week 21 |
| Whisper API Integration | Media & Dictation module | Week 7 |
| Cronograma (Treatment Timeline) | Separate component | Task 6.2, Week 6 |
| PDF/Report Export | Cross-module feature | Week 28-29 |
| Offline Storage (IndexedDB) | PWA Phase | Week 8 / Part 4 |
| Multi-language Toggle | Biblioteca Médica feature | Week 18 |
| New backend modules/endpoints | Backend team scope | As needed |

### Technical Considerations

**Frontend Patterns (Must Follow):**

- Manual `useState` + Zod validation (no React Hook Form)
- Shadcn/UI components where available (Button, Input, Label, Dialog, Card, Toast)
- Tailwind CSS for styling
- TypeScript strict mode

**Integration Points:**

- Existing `EvaluationForm.tsx` — enhance, don't replace
- Existing types in `patient.ts` — extend for new tests
- Existing API client in `patients.ts` — use existing methods
- Backend DTOs — verify compatibility, document gaps

**Performance Considerations:**

- Debounced saves (300ms) to prevent API flooding
- SVG body silhouette should be lightweight (<50KB)
- Lazy load voice recording module (Web Audio API)

**Accessibility:**

- Keyboard navigation for SVG points
- ARIA labels for interactive elements
- Touch targets ≥44px for tablet use
- Screen reader support for pain scale values

**Mobile/Tablet:**

- Primary use case is iPad during consultations
- Touch-friendly controls
- Responsive layout for sections
- Consider landscape orientation for posturogram view
