# Clinic Onboarding Guide (Non-Technical)

## Who this guide is for

This document is written for:

- Clinical stakeholders (clinic owners, lead doctors, therapists)
- Non-technical decision makers
- Team members with low patience for technology

If you can use WhatsApp and email, this guide is enough.

---

## What this onboarding does in one sentence

It helps a new user create a clinic safely in 3 small steps, without forcing unnecessary setup before they are ready.

---

## Why we do **not** create a clinic at the beginning (during sign-up)

This is intentional.

### Reason 1: Lower friction on Day 1

At registration, many users just want to try the product quickly. If we force clinic setup immediately, some users abandon.

### Reason 2: Not every user is a clinic owner yet

Some people are therapists exploring the app in personal mode first. Others are invited later into a clinic. Forcing clinic creation too early creates confusion.

### Reason 3: Better data quality

If we auto-create a clinic before the user is ready, we create many empty or incorrect clinics. Deferring clinic setup creates cleaner real records.

### Reason 4: Clear ownership moment

The first user who completes this onboarding becomes the initial clinic owner for that clinic. That ownership action is explicit and auditable.

---

## Core use cases

## 1) Solo therapist exploring first

- Registers account
- Clicks **"Configurar mas tarde"**
- Uses app in personal mode
- Can create clinic later from dashboard banner

## 2) New clinic founder

- Registers account
- Completes 3-step wizard
- Clinic is created
- User is set as **clinic owner**
- Lands on quick-start page with next actions

## 3) Clinic team expansion

- Founder optionally adds team invite emails in step 3
- System sends invitation records
- Team members can join after invitation acceptance

---

## The 3 steps (plain language)

## Step 1: Essentials (required)

User enters:

- Clinic name
- Contact email
- Optional phone

System checks name availability automatically.

## Step 2: Branding (optional)

User can add:

- Address
- Logo (image)
- Monday opening/closing time

User can skip this step.

## Step 3: Team (optional)

User can:

- Add invited teammate email(s)
- Choose role per invite (THERAPIST or CLINIC_OWNER)
- Remove invites before creating clinic

Then user creates clinic.

---

## Button-by-button behavior (exact outcomes)

This section explains what happens when each button is clicked.

## Step 1 buttons

### Button: `Siguiente`

- Enabled only when:
  - clinic name has at least 2 characters
  - email looks valid (contains `@`)
  - name is not marked as unavailable
- Action:
  - Moves user to Step 2

### Button: `Configurar mas tarde`

- Action:
  - Stores local flag that onboarding was skipped
  - Stores local flag for solo mode
  - Clears current wizard draft
  - Navigates to dashboard (`/`)
- User experience:
  - Dashboard shows personal-mode banner

## Step 2 buttons

### Button: `Atras`

- Action:
  - Moves back to Step 1
  - Keeps previously entered data (draft persists)

### Button: `Omitir por ahora`

- Action:
  - Moves directly to Step 3
  - Keeps optional branding fields unchanged

### Button: `Siguiente`

- Action:
  - Moves to Step 3
  - Keeps Step 2 data in draft

## Step 3 buttons

### Button: `+ Add another`

- Action:
  - Adds one invite row to in-memory draft list
  - Clears invite email input for next entry
  - Resets role selector to THERAPIST

### Button: `Quitar`

- Action:
  - Removes that invitation from the list before submission

### Button: `Atras`

- Action:
  - Returns to Step 2
  - Keeps all existing draft information

### Button: `Omitir por ahora`

- Action:
  - Submits clinic creation with current required data
  - Proceeds without team invites

### Button: `Crear clinica`

- Action:
  - Sends clinic creation request
  - If success:
    - updates signed-in user to clinic owner
    - clears skip/solo flags
    - clears draft
    - navigates to quick-start page
  - If error:
    - shows: `No se pudo crear la clinica. Intentalo nuevamente.`

---

## What happens after successful creation

User is redirected to `Quick Start` page with 3 clear next actions:

- Create first patient
- Invite team member
- Open clinic settings

This prevents the "now what?" moment.

---

## Common concerns from non-technical stakeholders

## "What if someone clicks the wrong thing?"

- Back buttons do not erase data.
- Draft is saved locally while onboarding is in progress.

## "What if internet/API fails during create?"

- The clinic is not partially created in UI state.
- User sees a clear error and can retry.

## "Can users skip forever?"

- They can work in personal mode.
- Product still nudges them to create clinic from dashboard banner.

## "Can two clinics have same name?"

- Name availability is checked early to reduce failed submissions.

---

## Data and trust notes

- Only required data is forced in Step 1.
- Optional data stays optional.
- Team invitations are optional.
- This flow is designed to reduce stress and improve completion rates for busy clinicians.

---

## Validation checklist covered by E2E tests

The following real scenarios are validated with Playwright E2E tests:

1. Step 1 blocks progress until required fields are valid.
2. Name unavailable state shows feedback and keeps `Siguiente` blocked.
3. `Configurar mas tarde` puts user in personal mode and navigates to dashboard.
4. Step 2 data persists when navigating back and forth.
5. Step 3 invite add/remove behavior works, and successful clinic creation redirects to quick-start.
6. Create error path shows explicit message and keeps user on onboarding.
7. Solo-mode migration request is triggered when solo flag is present.

These tests ensure that what is promised in this document is also working in the product.

---

## Summary for leadership

The onboarding is intentionally progressive:

- first reduce friction,
- then collect required essentials,
- then offer optional enrichment,
- then guide the user to immediate value.

This is why we do not force clinic creation at the first registration screen.

---

**Last Updated:** 2026-02-19
**Audience:** Non-technical stakeholders, clinical users, product leadership
