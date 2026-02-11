# Product Mission

## Pitch

MamirriApp is a "Zero-Friction" Digital Clinical Assistant that empowers Physiotherapists to capture, structure, and analyze clinical data through voice and vision, eliminating administrative burden while providing trusted, evidence-based diagnostic support.

## Users

### Primary Customers

- **Solo Physiotherapists:** Independent practitioners who need to maximize time with patients and minimize time on paperwork.
- **Manual Therapy Clinics:** Small to medium practices prioritizing hands-on treatment over complex administrative processes.

### User Personas

**The Expert Clinical Physiotherapist** (45-60)

- **Role:** Senior Practitioner / Clinic Owner.
- **Context:** High patient volume, hands-on work environment, often operates with limited time between sessions. Values direct patient contact over technology.
- **Pain Points:**
  - **Cognitive Overload:** Remembering details from previous sessions without reviewing piles of paper.
  - **Administrative Friction:** Typing on keyboards breaks the flow of manual therapy.
  - **Data Fragmentation:** Critical info lives in memory, phone gallery, and paper notes.
- **Goals:** A tool that "thinks with them" (not for them), works offline/online seamlessly, and creates legally defensible records without typing.

## The Problem

### Clinical Disconnection & Data Loss

Valuable clinical insights are lost because the friction of documenting them (typing, scanning, uploading) is too high during a therapy session. Current tools are "Administrative-First," turning therapists into data entry clerks and severing the human connection with the patient.

**Our Solution:** A **"Zero-UI" Tunnel Interface** that captures reality (voice, image) and transforms it into structured clinical records automatically. It acts as a resilient, privacy-first "Second Brain."

## Differentiators

### 1. Radical Simplicity ("The Tunnel")

Unlike complex EHRs with endless menus, our app uses a linear, one-way flow: **Start -> Dictate/Snap -> Analyze -> Finish**. It is designed to be used with one hand or voice commands on a tablet.

### 2. Privacy-First & "Grounded" AI

We prioritize data integrity and privacy. AI is used solely as a utility for transcription and analysis, strictly grounded in a curated, offline-first knowledge base (RAG). We never train external models on patient data, and all sensitive processing is anonymized.

### 3. Visual & Temporal Context

Beyond static text, we treat visual evolution as a core vital sign. The system aligns and compares "Before vs. After" images (e.g., footprints, posture) to objectively demonstrate progress to both the therapist and the patient.

## Key Features

### Core Experience (MVP)

- **Smart Voice Transcription:** Converts natural, unstructured clinical dictation into structured data fields (Name, Symptoms, History) automatically.
- **Guided Visual Capture:** Tablet-based camera module with "Ghost" overlays to ensure consistent, comparable photos of footprints and posture.
- **Offline-Resilient Architecture:** Fully functional without internet; caches data locally and syncs securely when connectivity returns.

### Clinical Intelligence (Post-MVP)

- **RAG "Second Brain":** Instantly retrieves relevant case studies and protocols from a curated library of 3-5 trusted clinical textbooks.
- **Hybrid Vision Analysis:** Combines deterministic computer vision (for image alignment/homography) with generative AI (for qualitative analysis) to highlight pathologies.
- **"Card-Based" Decision Support:** Presents findings as simple, actionable cards (Problem, Evidence, Solution) for quick review and approval by the human expert.

### Data Trust & Security

- **Immutable Session Logs:** Once finalized, sessions are locked to ensure legal and clinical integrity.
- **Decoupled Storage:** Clinical media is stored in secure, private object storage, strictly linked to patient records with no orphaned files.
