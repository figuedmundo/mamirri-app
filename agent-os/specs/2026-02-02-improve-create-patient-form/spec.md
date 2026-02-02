# Specification: Improve Create Patient Form

## Goal

Optimize the "Create Patient" experience for tablet users by reducing friction, automating redundant fields, and capturing critical medical context (emergency contact, flags) while ensuring data integrity with improved validation.

## User Stories

- As a **therapist on an iPad**, I want to enter birthdates using dropdowns (Day/Month/Year) so that I don't have to scroll back 50 years in a calendar picker.
- As a **therapist**, I want the patient's age to be calculated automatically so that I don't have to do mental math or enter redundant data.
- As a **clinic owner**, I want to capture referral sources and emergency contacts so that I have better business insights and patient safety.

## Specific Requirements

**Refactor PatientForm Component**

- Refactor `apps/client/src/components/patients/PatientForm.tsx` to remove the manual `age` input and `address` field.
- Implement `zod` schema updates: remove `age`/`address`, add `email` (email format), `emergencyContact` (object), `referralSource` (string), `medicalFlags` (array).
- Ensure `gender` selection works correctly by verifying value binding with `shadcn/ui` Select component.

**Split Date Picker Component**

- Create a new `SplitDatePicker` component composed of 3 `Select` inputs (Day, Month, Year).
- Year range: Current year down to 1900.
- Month: Localized full month names (Enero, Febrero, etc.).
- Validation: Ensure validity (e.g., prevent Feb 31st) and return a standard `Date` object or ISO string.

**New Data Fields (Frontend & Backend)**

- **Emergency Contact:** Add fields for Name and Phone. Store as `Json` in backend (`{ name: string, phone: string }`).
- **Referral Source:** Add `Select` or `Input` (with suggestions). Options: "Doctor", "Recomendación", "Instagram", "Google", "Otro".
- **Medical Flags:** Add a multi-select or tags input for: "Diabetes", "Hipertensión", "Marcapasos", "Embarazo", "Otro". Store as `String[]`.

**Tablet Optimization**

- Update `PatientForm` dialog to use `sm:max-w-[425px] md:max-w-screen-md lg:max-w-screen-lg` or full-screen on mobile breakpoints.
- Increase height of input fields and buttons to `h-12` (48px) for better touch targets.
- Increase gap between form rows to `gap-6`.

**Backend Migration**

- Update `Patient` model in `apps/server/prisma/schema.prisma`.
- Remove `age` and `address` columns.
- Add `emergencyContact` (Json), `referralSource` (String?), `medicalFlags` (String[]).
- Create and run migration.

## Visual Design

**No visuals provided**

- Use existing `shadcn/ui` styling.
- Layout: 2-column grid on tablet/desktop, 1-column on mobile.
- Section headers: "Datos Personales", "Contacto", "Información Médica".

## Existing Code to Leverage

**`apps/client/src/components/patients/PatientForm.tsx`**

- Base component to refactor. Reuse the `Dialog` wrapper and `zod` integration.

**`apps/client/src/components/ui/select.tsx`**

- Use for the `SplitDatePicker` (Day/Month/Year dropdowns).

**`apps/server/prisma/schema.prisma`**

- Update the `Patient` model definition here.

## Out of Scope

- Voice integration/dictation.
- "Wizard" style multi-step form.
- Importing patients from contacts.
- Profile picture upload (already exists or handled separately).
