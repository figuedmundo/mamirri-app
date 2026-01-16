# Specification: Export Comparison Report

## Goal

Enable therapists to export a professional PDF report from the ComparisonBoard component, demonstrating patient progress through before/after visual comparisons and clinical metrics with a single click.

## User Stories

- As a physiotherapist, I want to export a comparison report so that I can share objective progress evidence with patients and for medical records.
- As a physiotherapist, I want the export to work instantly on my iPad so that I can generate reports during or immediately after consultations without friction.

## Specific Requirements

**PDF Generation Utility**

- Create `generateComparisonReport.ts` in `apps/client/src/lib/pdf/`
- Use jsPDF library for PDF creation (add dependency `jspdf@^2.5.1`)
- Use html2canvas for capturing visual elements (add dependency `html2canvas@^1.4.1`)
- Export a single async function: `generateComparisonReport(clinicalCase: ClinicalCase, patient: Patient): Promise<void>`
- Function should handle the complete flow: fetch images, build PDF, trigger download

**PDF Content Structure**

- Header: Patient name, age, case title, date range (initial to final), generation date
- Visual Comparison: Side-by-side before/after footprint images with date stamps
- Clinical Metrics: Table with Metric | Initial | Final | Change columns
- Include: Pain scale (END), Barthel index, Schober test, session count, treatment duration
- Progress Summary: Text highlighting key improvements
- Footer: Therapist signature line (empty), clinical disclaimer, page numbers

**Image Handling**

- Fetch images from URLs (from `clinicalCase.evaluation.footprints`)
- Convert to base64 using canvas for PDF embedding
- Render as static side-by-side layout (not interactive slider)
- Handle missing images gracefully: show placeholder text "Imagen no disponible"

**Wire onExport Callback**

- Modify `ComparisonBoard.tsx` to accept `onExport` callback (already defined in props)
- Parent component (`CaseDetailLayout` or page) provides the handler
- Handler calls `generateComparisonReport()` with current case and patient data

**User Interaction Flow**

- Button click triggers export (existing "Exportar Informe" button)
- Show loading state on button during generation (spinner, 2-3 seconds typical)
- Auto-download PDF with filename: `informe-{patient-name-slug}-{YYYY-MM-DD}.pdf`
- Show success toast: "Informe descargado" using existing `useToast` hook
- Show error toast on failure: "Error al generar informe"

**Error Handling**

- Wrap PDF generation in try-catch
- If image fetch fails: Continue with PDF, show "Imagen no disponible" placeholder
- If PDF generation fails: Show error toast, log error to console
- If no final evaluation exists: Include section with "Evaluacion final pendiente" text

**Browser Compatibility**

- Must work on iPad Safari (primary user device)
- Test download behavior on iOS Safari (uses different download mechanism)
- Support desktop Chrome, Firefox, Safari

## Visual Design

No mockups provided. Follow these guidelines:

- Match existing ComparisonBoard styling for consistent look
- Use professional medical report layout conventions
- Clean typography with clear hierarchy (headers, subheaders, body text)
- Table styling should match clinical documentation standards
- Include adequate margins for printing (2cm all sides)

## Existing Code to Leverage

**`ComparisonBoard.tsx`**

- Location: `/apps/client/src/components/patients/ComparisonBoard.tsx`
- Already has `onExport` prop defined in interface
- Contains all data needed for report (clinicalCase with footprints, sessions, metrics)
- Export button UI already exists ("Exportar Informe")
- Follow existing button styling for loading state

**`CaseDetailLayout.tsx`**

- Location: `/apps/client/src/components/patients/CaseDetailLayout.tsx`
- Pattern for callback handlers (handleSaveEvaluation, handleSessionCreated)
- Shows how to wire callbacks with toast notifications
- Use same optimistic update + error handling pattern

**`useToast` hook**

- Location: `/apps/client/src/hooks/use-toast.ts`
- Standard toast pattern: `toast({ title: 'Title', description: 'Message' })`
- Error variant: `toast({ variant: 'destructive', title: 'Error', description: '...' })`
- Used consistently across the codebase

**Patient Types**

- Location: `/apps/client/src/types/patient.ts`
- `ClinicalCase` type has all required data: evaluation, treatmentSessions, footprints
- `ComparisonProps` interface already defines `onExport?: () => void`
- Leverage existing type definitions, do not create new ones

**`lib/` folder structure**

- Location: `/apps/client/src/lib/`
- Create new subfolder `pdf/` for PDF utilities
- Follow existing patterns from `utils.ts` and `axios.ts`

## Out of Scope

- Email or share functionality (handled by separate `onShare` callback)
- Print preview modal or dialog
- Server-side PDF generation or storage
- Custom report templates or theme selection
- Section selection checkboxes (include/exclude sections)
- Clinic branding or watermarks
- Password-protected or encrypted PDFs
- Multi-language support (Spanish only for MVP)
- Posture video frame extraction (use existing posture images if available)
- Integration with external services or cloud storage
