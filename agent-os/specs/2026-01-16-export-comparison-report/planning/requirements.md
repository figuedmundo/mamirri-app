# Spec Requirements: Export Comparison Report

## Initial Description

**Roadmap Task 6.11:** Wire callback: `onExport` (comparison report)

This feature implements the export functionality for the `ComparisonBoard` component, allowing therapists to generate a professional PDF report showing patient progress through before/after comparisons of footprints, posture analysis, and clinical metrics.

## Requirements Discussion

### First Round Questions

**Q1:** I assume the comparison report should include data from all three tabs in ComparisonBoard (Huellas Plantares, Analisis Postural, Datos Clinicos). Is that correct, or should we start with just one category?
**Answer:** All 3 tabs (complete report). The comparison report's purpose is to demonstrate patient progress comprehensively.

**Q2:** I'm thinking the export should generate a PDF document using jsPDF (as specified in the roadmap). Should we also support alternative formats like PNG image or is PDF sufficient for MVP?
**Answer:** PDF only (using jsPDF). PDFs are the standard for medical documentation, printable, and match the roadmap specification.

**Q3:** I assume the PDF should include: Patient name and case title, Date range, Before/After images, Clinical metrics table, Visual progress summary. Is this comprehensive enough?
**Answer:** Yes. Structure confirmed as: Header -> Images -> Metrics Table -> Summary -> Footer.

**Q4:** For the before/after images in the PDF, I'm assuming we'll include static side-by-side images (not the interactive slider) and download/fetch images from their URLs before embedding. Is that the expected approach?
**Answer:** Yes. Static side-by-side images, fetched client-side and embedded as base64.

**Q5:** I assume we'll generate the PDF client-side using jsPDF + html2canvas for capturing the comparison view. Should this be server-side generation instead?
**Answer:** Client-side generation. Simpler, works offline, matches Week 6 scope. Server-side may be needed for Week 28 (Plantillas 3D PDF).

**Q6:** When onExport is called, should the PDF download immediately, open in new tab, or show a modal with options?
**Answer:** Auto-download with toast notification. One click, immediate result, matches "Zero-Friction" product philosophy.

**Q7:** What should explicitly NOT be included in this initial implementation?
**Answer:** No email/share (covered by onShare), no print preview, no server storage, no custom templates, no section selection, no watermarks, no password protection.

### Existing Code to Reference

**Similar Features Identified:**

- Component: `ComparisonBoard.tsx` - Path: `/apps/client/src/components/patients/ComparisonBoard.tsx`
- Component: `BeforeAfterSlider.tsx` - Path: `/apps/client/src/components/ui/BeforeAfterSlider.tsx`
- Props Interface: `ComparisonProps` - Path: `/apps/client/src/types/patient.ts`
- Callback patterns: `CaseDetailLayout.tsx` - Path: `/apps/client/src/components/patients/CaseDetailLayout.tsx`
- Similar export UI: `Toolbar.tsx` (Plantillas) - Path: `/product-plan/sections/plantillas/components/Toolbar.tsx`

**Backend patterns to reference:**

- Storage service for image URLs: `/apps/server/src/modules/storage/storage.service.ts`

### Follow-up Questions

No follow-up questions were needed. User confirmed all recommendations.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

N/A - No mockups available. Implementation should follow existing ComparisonBoard styling and professional medical report conventions.

## Requirements Summary

### Functional Requirements

**Core Functionality:**

- Generate PDF report from ComparisonBoard data
- Include all three comparison categories (footprints, posture, clinical data)
- Embed before/after images as static side-by-side comparisons
- Display clinical metrics in tabular format with change indicators
- Auto-download PDF to user's device on button click
- Show success toast notification after download

**PDF Content Structure:**

1. **Header Section**
   - Patient name and age
   - Clinical case title
   - Date range (initial to final evaluation)
   - Generation date

2. **Visual Comparison Section**
   - Before/After footprint images (side-by-side)
   - Before/After posture images (if available)
   - Date stamps on each image
   - Analysis notes (arch improvement, etc.)

3. **Clinical Metrics Section**
   - Table with columns: Metric | Initial | Final | Change
   - Pain scale (END): e.g., 9/10 -> 4/10 (-5)
   - Barthel index: e.g., 8/12 -> 11/12 (+3)
   - Orthopedic tests (Schober, etc.)
   - Session count and duration

4. **Progress Summary Section**
   - Text summary of improvements
   - Key achievements highlighted

5. **Footer Section**
   - Therapist signature line (empty)
   - Clinical disclaimer
   - Page numbers

**User Interaction:**

- Single button click triggers export
- Loading state on button during generation (2-3 seconds)
- Success toast: "Informe descargado"
- Filename format: `informe-{patient-name}-{date}.pdf`

### Reusability Opportunities

**Components that exist:**

- `ComparisonBoard.tsx` - Already has onExport prop, just needs wiring
- `BeforeAfterSlider.tsx` - Reference for image comparison layout
- Toast system (via Shadcn/UI) - For success notification

**New utilities to create:**

- `generateComparisonReport.ts` - Reusable PDF generation function
- Can be extended for future exports (Plantillas PDF in Week 28)

**Backend patterns to follow:**

- No backend changes needed for MVP
- Client-side only implementation

### Scope Boundaries

**In Scope:**

- Wire onExport callback in ComparisonBoard
- Create PDF generation utility using jsPDF + html2canvas
- Fetch and embed images from URLs
- Generate structured clinical report
- Auto-download with toast feedback
- Support iPad Safari (primary device)
- Work offline if data already loaded

**Out of Scope:**

- Email/share functionality (separate onShare callback)
- Print preview modal
- Server-side PDF storage
- Custom report templates
- Section selection (checkboxes to include/exclude)
- Watermarks or clinic branding
- Password-protected PDFs
- Multi-language support (Spanish only for MVP)

### Technical Considerations

**Dependencies to add:**

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

**Files to create:**

- `apps/client/src/lib/pdf/generateComparisonReport.ts` - PDF generation logic

**Files to modify:**

- `apps/client/src/components/patients/ComparisonBoard.tsx` - Wire callback
- Parent component (PatientDetail or CaseDetailLayout) - Provide onExport handler

**Browser compatibility:**

- Must work on iPad Safari (primary user device)
- Desktop Chrome/Firefox/Safari support

**Performance considerations:**

- Image fetching may take 1-2 seconds
- PDF generation typically 2-3 seconds
- Show loading state during process
- Handle image fetch failures gracefully

**Data sources:**

- `clinicalCase.evaluation.footprints` - Before/after footprint images
- `clinicalCase.evaluation.postureVideos` - Posture data (screenshots from video frames)
- `clinicalCase.evaluation.painScale` - Initial pain levels
- `clinicalCase.treatmentSessions` - Final pain levels, session count
- `clinicalCase.evaluation.avdEvaluation.barthel` - Functional scores
- `clinicalCase.evaluation.orthopedicTests` - Test results

**Error handling:**

- If images fail to load: Generate PDF without images, show warning
- If PDF generation fails: Show error toast, log to console
- If no final evaluation data: Show message in PDF ("Evaluacion final pendiente")
