# Patient Flow Evaluation (SOAP)

The Patient Flow Evaluation in Mamirri App is designed to provide a **SOAP-based** (Subjective, Objective, Assessment, Plan) clinical documentation experience that minimizes cognitive load for physiotherapists while maximizing clinical accuracy.

## 📋 Overview

The evaluation flow follows a **Diagnosis-First** philosophy, where the therapist identifies the clinical problem before defining the treatment phases. It simplifies the relationship between a Clinical Case and its evaluations from a 1:N model to a **1:1 model**, reflecting that most patients do not complete full longitudinal assessment series in a typical clinic setting.

## 🛠 Clinical Methodology (SOAP)

The evaluation is structured into four sequential tabs, encouraging a progressive disclosure of information:

### 1. Subjective (S)

- **Goal**: Capture the patient's perspective, history, and symptoms.
- **Dictation-First**: Uses a floating voice recorder to capture the patient's story without the therapist needing to type.
- **Transcription**: Audio is automatically transcribed and populated into the subjective notes area.

### 2. Objective (O)

- **Goal**: Record measurable physical findings.
- **Pain Scale**: Visual sliders for Rest, Activity, and Palpation pain (0-10).
- **Orthopedic Tests**: A searchable library of physical tests (Thomas, Ober, Lasègue, etc.).
  - Therapists only add the tests they actually perform, reducing on-screen clutter.
  - Results are categorized (Normal, Mild, Moderate, Severe) with space for clinical interpretation.

### 3. Assessment (A)

- **Goal**: Formulate a clinical diagnosis based on S and O.
- **Diagnosis Structure**:
  - **Functional Indicator**: Impact on patient function.
  - **Clinical Aspect**: Observed signs and symptoms.
  - **Anatomopathology**: Structural or tissue-level issues.
  - **AVD Consequences**: Impact on Activities of Daily Living.

### 4. Plan (P)

- **Goal**: Define the therapeutic strategy.
- **Dependency**: The Plan tab is only fully enabled once a diagnosis has been formulated in the Assessment section.
- **Manual Phases**: Treatment phases are defined manually by the therapist based on the diagnosis, rather than being pre-calculated.

## 📱 User Experience (Tablet-Optimized)

The interface is specifically designed for **Android and iPad tablets**:

- **Large Touch Targets**: Easy selection of sections and buttons.
- **Progressive Disclosure**: Only relevant fields are shown at any given time to avoid "form fatigue".
- **Auto-Save**: Changes are automatically saved with a 350ms debounce to ensure no data loss even if the app is closed or the tablet battery dies.

## 💾 Data Model Integration

- **1:1 Cardinality**: Each `ClinicalCase` now has exactly one `Evaluation`. This reduces complexity in data retrieval and reporting.
- **JSON Storage**: Complex clinical data (pain scales, test results, diagnosis objects) is stored as JSON in PostgreSQL for maximum flexibility as clinical standards evolve.
- **Transcription Integration**: Voice notes are linked directly to the evaluation, providing a permanent record of the raw subjective data.

---

**Last Modified:** 2026-02-26
**Related Documents:**

- [Database Schema](../technical/database-schema.md)
- [AI Analysis Guide](../technical/ai-analysis-feature-guide.md)
