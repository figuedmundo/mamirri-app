# Spec Requirements: Improve Create Patient Form

## Initial Description

The form has fields that maybe are redundant like age but at the same time birthdate, if birthdate we dont need enter the age, the gender doesnt work, there is no validaton for the email, if the date picker of birth date can imrpove would be valuable for the doctor , 2 no voice integration, 3 single page form with better UX and optmizized for tablets, (my mom has and android) , 4 suggest please, and explain

## Requirements Discussion

### First Round Questions

**Q1:** Feedback Drivers: I assume this improvement is driven by specific friction points found during field testing (Task 9.3). Could you list the top 2-3 specific problems we are solving?
**Answer:** The form has fields that maybe are redundant like age but at the same time birthdate, if birthdate we dont need enter the age, the gender doesnt work, there is no validaton for the email, if the date picker of birth date can imrpove would be valuable for the doctor

**Q2:** Voice Integration: Should we implement a "Dictate to Create" feature?
**Answer:** No voice integration.

**Q3:** Layout Strategy: Should we move towards a "Wizard" style or stick to a single-page form with better spacing?
**Answer:** Single page form with better UX and optmizized for tablets, (my mom has and android)

**Q4:** Data Requirements: Are there any changes to the actual data model, or is this strictly a UX/UI improvement?
**Answer:** Suggest please, and explain

### Existing Code to Reference

No specific reference paths provided by user, but I identified:

- Existing Form: `apps/client/src/components/patients/PatientForm.tsx`

### Follow-up Questions

**Follow-up 1:** New Fields Confirmation: Emergency Contact, Referral Source, Medical Flags, Address?
**Answer:** I like your suggestion, address remove. (So: Add Emergency Contact, Referral Source, Medical Flags. Remove Address.)

**Follow-up 2:** Date Picker Improvement: Option A (3 dropdowns) or Option B (Calendar)?
**Answer:** Option A (3 separate inputs/dropdowns for Day/Month/Year).

**Follow-up 3:** Single Page vs Modal: Convert to route or Keep dialog (Full-screen)?
**Answer:** Keep dialog, and yes it can be full screen mode on tablets.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual assets provided.

## Requirements Summary

### Functional Requirements

- **Auto-calculate Age:** Remove manual 'age' input. Display calculated age based on birthdate.
- **Improved Date Picker:** Replace native browser picker with a custom 3-field input (Day / Month / Year) to facilitate selecting birth years (preventing "scroll back to 1950" issue on Android).
- **Email Validation:** Implement proper email format validation (optional field, but must be valid if entered).
- **Fix Gender Selection:** Ensure the gender dropdown works correctly (user reported it "doesn't work").
- **New Fields:**
  - **Emergency Contact:** Name and Phone number.
  - **Referral Source:** Dropdown or text (e.g., Doctor, Recommendation, Social Media).
  - **Medical Flags:** Boolean tags for critical conditions (Diabetes, Hypertension, Pacemaker, etc.).
- **Remove Field:** Remove 'Address' field.
- **Tablet Optimization:**
  - Increase touch target sizes for inputs and buttons (min 44px).
  - Adjust spacing for better readability on tablet screens.
  - Dialog should be full-screen or near full-screen on mobile/tablet viewports to maximize workspace.

### Reusability Opportunities

- **Existing PatientForm:** Refactor `apps/client/src/components/patients/PatientForm.tsx` instead of building from scratch.
- **UI Components:** Reuse `shadcn/ui` components (Select, Input, Button, Dialog) but customize/compose them for the DatePicker.

### Scope Boundaries

**In Scope:**

- Refactoring `PatientForm.tsx`.
- Updating validation schema (`zod`).
- Creating/Integrating a "Split Date Picker" component.
- Updating backend entity/DTO if new fields (Emergency Contact, etc.) need storage (Check if these fields exist in DB, if not, backend work is needed). _Self-correction: User asked for suggestions, implying these might be new. I will assume backend update is needed for new fields._

**Out of Scope:**

- Voice integration.
- Wizard (Multi-step) flow.
- "Address" field (removing it).

### Technical Considerations

- **Touch Optimization:** Ensure all interactive elements are touch-friendly (Android tablet target).
- **Validation:** Use `zod` for strict validation (especially email and birthdate logic).
- **Responsive Dialog:** Use Shadcn/UI Dialog's responsive capabilities to handle full-screen on smaller devices.
- **Backend Sync:** Ensure `Patient` entity in Prisma schema is updated to support `emergencyContact`, `referralSource`, and `medicalFlags` (likely a JSON field or separate columns).
