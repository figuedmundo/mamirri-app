# Specification: PacienteProfile Enhancement

## Goal

Enhance the existing PatientProfile component to display a media gallery of clinical photos/videos, enable navigation to case details, and update placeholder actions with proper messaging.

## User Stories

- As a physiotherapist, I want to see thumbnails of footprints and posture videos on the patient profile so that I can quickly review visual clinical data without navigating away.
- As a physiotherapist, I want to click on a past case card to view its full details so that I can review historical treatments efficiently.

## Specific Requirements

**Media Gallery Section**

- Add a horizontal scrolling gallery below the Active Case section in PatientProfile
- Display thumbnails from `activeCase.evaluation.footprints[]` and `activeCase.evaluation.postureVideos[]`
- Show image thumbnails at 80x80px with rounded corners matching existing card styling
- Video thumbnails should display a play icon overlay to distinguish from images
- Limit visible thumbnails to viewport width with horizontal scroll for overflow
- Consider lazy loading thumbnails for performance

**Lightbox Modal for Media Viewing**

- Clicking a thumbnail opens a full-screen lightbox modal using existing Dialog component pattern
- Display image at max viewport size while maintaining aspect ratio
- For videos, embed a native HTML5 video player with controls
- Include left/right navigation arrows to browse between media items
- Include close button (X) in top-right corner with keyboard support (Escape to close)
- Trap focus within modal for accessibility compliance

**Past Case Navigation**

- Wire `onClick` handler on past case cards in the Historial Clinico section
- Navigate to `/pacientes/:patientId/casos/:caseId` route
- Add this route to App.tsx router configuration (will render CaseDetailLayout from task 5.3)
- Use `useNavigate()` hook following existing pattern in Patients.tsx

**Active Case "Ver Expediente Completo" Link**

- Wire the existing "Ver Expediente Completo" button to navigate to active case detail
- Route: `/pacientes/:patientId/casos/:activeCaseId`
- Only render button when `activeCase` exists

**Placeholder Action Updates**

- Update toast messages for Voice Dictation, Capture Footprint, and Capture Video buttons
- Change from "Simulando..." to "Disponible proximamente"
- Keep button styling and icons unchanged

**Empty State for Media Gallery**

- Display when no footprints AND no postureVideos exist in active case evaluation
- Show subtle placeholder: camera icon + "No hay fotos o videos capturados"
- Use muted styling consistent with existing empty states (slate-50 background, dashed border)

## Visual Design

No mockups provided. Follow existing design patterns from PatientProfile.tsx and PatientList.tsx.

## Existing Code to Leverage

**PatientProfile.tsx Component**

- Path: `apps/client/src/components/patients/PatientProfile.tsx`
- Contains the base layout to enhance with media gallery
- Reuse existing ActionCard and MetricCard sub-components for styling consistency
- Past case cards already have hover states and cursor-pointer styling

**Dialog Component (Radix UI)**

- Path: `apps/client/src/components/ui/dialog.tsx`
- Use as base for Lightbox modal implementation
- Extend with custom content for image/video viewing
- Already handles overlay, close button, and portal rendering

**Navigation Pattern**

- Path: `apps/client/src/pages/Patients.tsx`
- Follow `handleView` pattern: `navigate(/pacientes/${id})`
- Use `useNavigate` from react-router-dom

**Type Definitions**

- Path: `apps/client/src/types/patient.ts`
- `Footprint` interface includes: id, url, type, date, analysis
- `PostureVideo` interface includes: id, url, type, duration, observations
- Access via: `patient.clinicalCases[].evaluation.footprints[]`

**App Router**

- Path: `apps/client/src/App.tsx`
- Add new route for `/pacientes/:id/casos/:caseId`
- Follow existing ProtectedRoute + MainLayout wrapper pattern

## Out of Scope

- Actual media capture implementation (camera integration) - deferred to Week 7
- Voice dictation recording and transcription - deferred to Week 7
- New Evaluation form creation - covered in task 6.1
- Create New Case flow - separate feature
- Backend API changes - media data already available via existing endpoints
- Image upload or deletion functionality
- Media editing or annotation features
- Offline caching of media files
- Video streaming optimization
- CaseDetailLayout page implementation - covered in task 5.3
