# Pacientes

## Overview

El sistema central de expediente clínico, actuando como una "Bitácora de Atleta Profesional" (o "Tablero de Piloto") para gestionar la historia, evaluaciones y evolución del paciente. Se centra en la "Ficha de Evaluación Cinético Funcional", organizando la historia por Casos/Episodios, utilizando IA de voz para la admisión estructurada, y presentando una línea de tiempo visual del modelo de intervención de 15 sesiones.

## User Flows

- **Admisión y Anamnesis por Voz:** El usuario crea un perfil -> Paso guiado de Anamnesis por Voz (narrando "Motivo de Consulta", "Antecedentes Patológicos") -> La IA estructura los datos en el expediente clínico.

- **Registro de Sesión (Check-in):** El usuario abre un Caso activo -> Clic en el botón flotante (FAB) para añadir nota de "Evolución Diaria" -> Registra escala de dolor (END) e índice funcional (Barthel).

- **Evaluación Comparativa:** El usuario accede a la vista "Posturograma" -> Usa un componente "Split Slider" para comparar visualmente la postura Inicial vs. Actual (planos Frontal/Sagital) y verificar la corrección de desviaciones (ej. hipercifosis).

- **Revisión de Progreso:** El usuario ve el Dashboard de Pacientes -> Escanea "Tarjetas" para ver estadísticas rápidas (Dolor 9/10 -> 5/10) -> Profundiza en la Línea de Tiempo del Caso para ver la progresión a través de las 4 fases de intervención.

## Design Decisions

- Split layout with clinical timeline on left, detailed content on right for comprehensive case overview
- Floating Action Button (FAB) for quick access to add evolution notes during consultations
- Voice dictation integration for hands-free clinical documentation
- Before/After slider for visual posture comparison tracking
- Card-based patient list with quick metrics (pain level, session count) visible at glance

## Data Used

**Entities:** Paciente, CasoClinico, Evaluacion, SesionDeTratamiento, PlanDeTratamiento, Huella, VideoDePostura

**From global model:** Paciente, CasoClinico, Huella, VideoDePostura, Plantilla, ReferenciaBibliografica

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- **PacientesList** — Grid of patient cards with search, filters, and quick actions
- **PacienteProfile** — Detailed patient view with cases history, photos, and action buttons
- **EvaluacionForm** — Form for recording clinical evaluation with posturograma, orthopedic tests
- **ComparacionBoard** — Before/After visual comparison slider for posture tracking
- **Cronograma** — Treatment sessions timeline with phase indicators
- **CaseDetailLayout** — Split layout wrapper showing clinical timeline and content
- **CaseTimeline** — Visual timeline of clinical case phases and sessions
- **PosturogramViewer** — Interactive posturogram viewer with anatomical point markers

## Callback Props

| Callback               | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `onView`               | Called when user clicks to view patient details                    |
| `onCreate`             | Called when user clicks "Nuevo Paciente" button                    |
| `onEdit`               | Called when user wants to edit patient information                 |
| `onDelete`             | Called when user wants to delete a patient                         |
| `onSchedule`           | Called when user wants to schedule appointment in Google Calendar  |
| `onVoiceDictation`     | Called when user wants to start voice dictation for clinical notes |
| `onCaptureHuella`      | Called when user wants to capture footprint image                  |
| `onCaptureVideo`       | Called when user wants to capture posture video                    |
| `onSave`               | Called when user saves evaluation form data                        |
| `onPosturogramaChange` | Called when user marks deviations on posturograma                  |
| `onPainScaleChange`    | Called when user updates pain scale values                         |
| `onExport`             | Called when user wants to export comparison report                 |
| `onShare`              | Called when user wants to share comparison with patient            |
| `onViewSession`        | Called when user clicks to view session details                    |
| `onAddSession`         | Called when user wants to add new treatment session                |
| `onEditSession`        | Called when user wants to edit a treatment session                 |
