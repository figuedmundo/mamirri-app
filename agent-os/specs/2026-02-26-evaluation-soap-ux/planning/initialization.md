# Initialization: Evaluation SOAP UX

## Source

Roadmap task 9.12 — Week 9: Field Testing ("The Truth") → Issues raised

## Raw Idea (Doctor's Feedback)

Three issues raised during field testing of the SOAP evaluation form (implemented in task 9.11):

1. **Language violations (ADR 008):** The evaluation SOAP form is not following the language strategy — English labels appear in the UI where Spanish should be used. Specifically: tab labels ("S - Subjective", "O - Objective", "A - Assessment", "P - Plan"), section headings, and pain scale field names ("activity", "rest", "palpation").

2. **UI/UX quality:** The form needs improvement using UI/UX skills — the current implementation is bare-bones with plain inputs, no visual hierarchy, and no guidance for the therapist.

3. **P-Plan tab is non-functional:** The doctor is confused about the purpose of the Plan tab — "I can't do nothing inside that tab." The Plan section only renders static text (either a warning or a redirect message), with zero interactive elements.
