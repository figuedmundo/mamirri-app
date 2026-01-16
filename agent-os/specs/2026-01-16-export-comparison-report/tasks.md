# Task Breakdown: Export Comparison Report

## Overview

Total Tasks: 14 sub-tasks across 3 task groups

**Feature Type:** Frontend-only (no backend/database changes required)

**Key Dependencies:**

- jsPDF ^2.5.1
- html2canvas ^1.4.1

## Task List

### Setup & Dependencies

#### Task Group 1: Project Setup

**Dependencies:** None

- [x] 1.0 Complete project setup
  - [x] 1.1 Add npm dependencies
    - Run: `pnpm add jspdf html2canvas --filter client`
    - Verify packages added to `apps/client/package.json`
  - [x] 1.2 Create lib/pdf folder structure
    - Create: `apps/client/src/lib/pdf/`
    - Create: `apps/client/src/lib/pdf/index.ts` (barrel export)
  - [x] 1.3 Verify TypeScript types available
    - jsPDF includes types
    - html2canvas includes types
    - No additional @types packages needed

**Acceptance Criteria:**

- Dependencies installed and listed in package.json
- Folder structure created
- No TypeScript errors from new packages

---

### PDF Generation Layer

#### Task Group 2: PDF Generation Utility

**Dependencies:** Task Group 1

- [x] 2.0 Complete PDF generation utility
  - [x] 2.1 Write 4-6 focused tests for PDF generation
    - Test: `generateComparisonReport` returns void (no errors)
    - Test: Handles missing footprint images gracefully
    - Test: Generates correct filename format
    - Test: Includes patient name in PDF content
    - Test: Handles empty treatment sessions array
    - Mock: jsPDF and html2canvas to avoid actual PDF generation in tests
  - [x] 2.2 Create image fetch utility
    - File: `apps/client/src/lib/pdf/fetchImageAsBase64.ts`
    - Async function: `fetchImageAsBase64(url: string): Promise<string | null>`
    - Use canvas to convert image to base64
    - Return null on fetch failure (graceful degradation)
  - [x] 2.3 Create PDF content builder
    - File: `apps/client/src/lib/pdf/generateComparisonReport.ts`
    - Function signature: `generateComparisonReport(clinicalCase: ClinicalCase, patient: Patient): Promise<void>`
    - Import types from `@/types/patient`
  - [x] 2.4 Implement PDF header section
    - Patient name and age
    - Case title
    - Date range (initial evaluation to latest session)
    - Generation date (current date)
  - [x] 2.5 Implement visual comparison section
    - Fetch before/after footprint images
    - Render side-by-side with date stamps
    - Show "Imagen no disponible" if fetch fails
  - [x] 2.6 Implement clinical metrics table
    - Table columns: Metric | Initial | Final | Change
    - Rows: Pain scale (END), Barthel total, Schober test
    - Session count and treatment duration
    - Calculate change values with +/- indicators
  - [x] 2.7 Implement progress summary and footer
    - Text summary of improvements
    - Empty signature line
    - Clinical disclaimer text
    - Page numbers
  - [x] 2.8 Implement file download trigger
    - Filename format: `informe-{patient-name-slug}-{YYYY-MM-DD}.pdf`
    - Use jsPDF `save()` method
    - Ensure iPad Safari compatibility (blob download)
  - [x] 2.9 Export from barrel file
    - Update `apps/client/src/lib/pdf/index.ts`
    - Export: `generateComparisonReport`
  - [x] 2.10 Run PDF generation tests
    - Run only tests in `lib/pdf/` folder
    - Verify all 4-6 tests pass

**Acceptance Criteria:**

- All 4-6 PDF generation tests pass
- Function generates valid PDF structure
- Images fetched and embedded correctly
- Missing data handled gracefully
- Download works on iPad Safari

---

### Component Integration

#### Task Group 3: Wire Callback & UI Integration

**Dependencies:** Task Group 2

- [x] 3.0 Complete component integration
  - [x] 3.1 Write 3-4 focused tests for integration
    - Test: Export button triggers onExport callback
    - Test: Loading state shown during export
    - Test: Success toast displayed after export
    - Test: Error toast displayed on failure
    - Use existing test patterns from `CaseDetailLayout.test.tsx`
  - [x] 3.2 Add loading state to ComparisonBoard export button
    - File: `apps/client/src/components/patients/ComparisonBoard.tsx`
    - Add local state: `isExporting: boolean`
    - Show spinner icon when `isExporting` is true
    - Disable button during export
  - [x] 3.3 Create export handler in parent component
    - File: Determine appropriate parent (PatientDetail page or new comparison page)
    - Create `handleExportReport` async function
    - Import `generateComparisonReport` from `@/lib/pdf`
    - Wrap in try-catch with toast notifications
    - Pattern: Follow `handleSaveEvaluation` from CaseDetailLayout
  - [x] 3.4 Wire onExport prop to ComparisonBoard
    - Pass `handleExportReport` to ComparisonBoard's `onExport` prop
    - Pass loading state setter to manage button state
  - [x] 3.5 Implement toast notifications
    - Success: `toast({ title: 'Informe descargado', description: 'El informe se ha guardado correctamente.' })`
    - Error: `toast({ variant: 'destructive', title: 'Error', description: 'No se pudo generar el informe.' })`
  - [x] 3.6 Run integration tests
    - Run only tests related to ComparisonBoard and export
    - Verify all 3-4 tests pass

**Acceptance Criteria:**

- All 3-4 integration tests pass
- Button shows loading spinner during export
- Toast notifications appear correctly
- Full flow works: click → loading → download → success toast

---

## Execution Order

Recommended implementation sequence:

```
1. Task Group 1: Project Setup (15 min)
   └── Dependencies + folder structure

2. Task Group 2: PDF Generation Utility (2-3 hours)
   ├── 2.1 Write tests first
   ├── 2.2-2.8 Implement utility
   └── 2.9-2.10 Export and verify

3. Task Group 3: Component Integration (1-2 hours)
   ├── 3.1 Write tests first
   ├── 3.2-3.5 Wire components
   └── 3.6 Verify integration
```

**Estimated Total Time:** 4-6 hours

---

## Testing Summary

| Task Group | Tests Written | Focus                |
| ---------- | ------------- | -------------------- |
| Group 1    | 0             | Setup only           |
| Group 2    | 4-6           | PDF generation logic |
| Group 3    | 3-4           | UI integration       |
| **Total**  | **7-10**      | Core functionality   |

---

## Files to Create

| File                                                       | Description         |
| ---------------------------------------------------------- | ------------------- |
| `apps/client/src/lib/pdf/index.ts`                         | Barrel export       |
| `apps/client/src/lib/pdf/fetchImageAsBase64.ts`            | Image fetch utility |
| `apps/client/src/lib/pdf/generateComparisonReport.ts`      | Main PDF generation |
| `apps/client/src/lib/pdf/generateComparisonReport.test.ts` | PDF tests           |

## Files to Modify

| File                                                      | Changes                |
| --------------------------------------------------------- | ---------------------- |
| `apps/client/package.json`                                | Add jspdf, html2canvas |
| `apps/client/src/components/patients/ComparisonBoard.tsx` | Add loading state      |
| Parent component (TBD)                                    | Wire onExport handler  |

---

## Notes

- **No backend changes required** - entirely client-side
- **No database changes required** - uses existing data structures
- **iPad Safari compatibility** is critical - test download behavior
- **Graceful degradation** - PDF generates even if images fail to load
