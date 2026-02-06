# Phase 4: Advanced Support (Posture & Gait)

**Duration:** 8-12 weeks  
**Status:** 🔴 Not Started  
**Goal:** AI-assisted visual analysis

---

## 4.1 Image Analysis & Clinical Precision (Hybrid AI)

To ensure clinical-grade measurements (e.g., spinal deviation degrees), the system will use a **Hybrid AI Architecture**:

1.  **Kinematic Layer (MediaPipe Pose)**:
    - **Function**: Automatically detects 33 anatomical landmarks (shoulders, hips, spine) in real-time.
    - **Benefit**: Provides deterministic geometric measurements (angles, distances) with high precision, avoiding "AI hallucinations" of numerical values.
    - **Implementation**: Client-side (Tablet/Browser) for instant feedback during photo capture.

2.  **Cognitive Layer (Gemini Vision)**:
    - **Function**: Receives the photo + the measurements from MediaPipe.
    - **Benefit**: Provides the "Second Eye" interpretation—qualitative analysis of muscle tone, skin appearance, and correlating measurements with clinical medical literature.

### Features:

- **Spinal Deviation (Central Bone)**: Calculation of Cobb angle approximation using MediaPipe midline landmarks.
- **Footprint Analysis (Huellas)**: Geometric arch height index + Gemini analysis of pressure distribution.
- **Image comparison over time**: Overlaying MediaPipe skeletons from different sessions to visualize progress.

⚠️ **Disclaimer:**
"Visual assistance and automated landmarking to support therapist assessment, not a certified standalone medical diagnosis."

---

## 4.2 Orthotics (Conceptual Level)

- Record conceptual design
- Adjustment history
- Design → clinical evolution relationship

**Not CAD yet**

---

**Last Updated:** $(date +%Y-%m-%d)
