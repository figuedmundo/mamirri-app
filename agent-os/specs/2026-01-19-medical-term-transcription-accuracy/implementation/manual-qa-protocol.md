# Manual QA Protocol: Transcription Accuracy

**Spec:** Medical Term Transcription Accuracy
**Device Target:** iPad (Safari) / iPhone (Safari)
**Goal:** Verify real-world dictation accuracy in the target clinical environment.

## Test Environment Setup

1.  **Device:** Use the iPad intended for clinical use (or similar).
2.  **Browser:** Open the Mamirri App in Safari.
3.  **Network:** Test on both WiFi and 4G (if available) to verify latency.
4.  **Microphone:** Ensure permission is granted.
5.  **Location:** Quiet room (simulating a consultation room).

## Test Checklist

### 1. Curated Vocabulary Validation

Dictate each term clearly. Check if the transcription matches EXACTLY.

| Term                        | Transcription Result | Pass/Fail |
| --------------------------- | -------------------- | --------- |
| fascitis plantar            |                      |           |
| escoliosis                  |                      |           |
| lumbalgia                   |                      |           |
| cervicalgia                 |                      |           |
| ciática                     |                      |           |
| hernia discal               |                      |           |
| tendinitis                  |                      |           |
| contractura muscular        |                      |           |
| esguince                    |                      |           |
| bursitis                    |                      |           |
| síndrome del túnel carpiano |                      |           |
| epicondilitis               |                      |           |
| gonalgia                    |                      |           |
| coxalgia                    |                      |           |
| dorsalgia                   |                      |           |
| parestesia                  |                      |           |
| hiperlordosis               |                      |           |
| cifosis                     |                      |           |
| prueba de Lasègue           |                      |           |
| maniobra de Phalen          |                      |           |
| test de Thomas              |                      |           |
| escala EVA                  |                      |           |
| índice de Barthel           |                      |           |
| goniometría                 |                      |           |

### 2. Full Clinical Note Scenarios

Dictate these full scenarios at a natural, conversational pace.

**Scenario A: Initial Assessment**

> "Paciente de 35 años acude por cervicalgia tensional tras accidente de tráfico. Presenta rectificación de la lordosis cervical y contractura muscular en trapecio bilateral. Eva seis sobre diez."

- **Accuracy Check:** [ ] >90% words correct
- **Key Terms:** [ ] cervicalgia, [ ] lordosis, [ ] contractura, [ ] trapecio, [ ] Eva

**Scenario B: Progress Note**

> "Mejoría significativa de la lumbalgia. El paciente refiere dolor escala EVA dos sobre diez. Se realiza goniometría de flexión lumbar con resultado normal. Mantiene leve parestesia en pie derecho."

- **Accuracy Check:** [ ] >90% words correct
- **Key Terms:** [ ] lumbalgia, [ ] Eva, [ ] goniometría, [ ] parestesia

### 3. Critical Error Check

Did you observe any dangerous substitutions? (e.g., "hipotensión" instead of "hipertensión", "derecho" instead of "izquierdo")

- [ ] No critical errors observed.
- [ ] Critical errors observed: ************\_\_************

## Results Summary

- **Device Used:** ************\_\_************
- **OS Version:** ************\_\_************
- **Network:** ************\_\_************
- **Total Terms Passed:** **\_** / 25
- **Overall Experience:** [ ] Excellent [ ] Good [ ] Poor
