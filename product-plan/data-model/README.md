# Data Model

## Overview

This data model defines the core entities for the Mamirri App physical therapy management system.

## Core Entities

### Paciente (Patient)
The person receiving treatment, with complete medical history.
- **Fields**: id, nombre, apellido, fechaNacimiento, contacto, foto, casos

### CasoClinico (Clinical Case)
A specific treatment episode for a condition (e.g., "lower back pain", "flat foot").
- **Fields**: id, pacienteId, diagnostico, fechaInicio, estado, evaluacionInicial, planTratamiento, sesiones, plantillas
- **States**: activo, completado, en_seguimiento

### Evaluación (Evaluation)
Diagnostic session with photos, videos, and initial findings.
- **Fields**: id, casoId, fecha, motivoConsulta, antecedentesPatologicos, examenes, huellas, videosPostura, notas

### ExamenFuncional (Functional Exam)
Functional tests performed during evaluation (Thomas, Ely, Schober, Finger-to-Floor, Barthel, Lawton).
- **Fields**: id, evaluacionId, tipo, resultado, observaciones

### Plan de tratamiento (Treatment Plan)
Treatment plan defined by the doctor with objectives and modalities.
- **Fields**: id, casoId, objetivos, modalidades, referenciasBibliograficas, notas
- **Modalities**: plantillas, masajes, ejercicios, combinado

### Sesión de tratamiento (Treatment Session)
Visits where the plan is executed and progress monitored.
- **Fields**: id, casoId, fecha, numeroSesion, nivelDolor, indiceBarthel, notasEvolucion, procedimientosRealizados
- **Pain Scale**: END (0-10)
- **Independence Index**: Barthel (0-100)

### Huella (Footprint)
Footprint images captured for visual analysis.
- **Fields**: id, evaluacionId, pie, imagenUrl, tipoBoveda, zonasPresion, fechaCaptura
- **Arch Types**: plano, cavo, normal

### Video de postura (Posture Video)
Recordings of gait or postures for biomechanical analysis.
- **Fields**: id, evaluacionId, tipo, vistas, videoUrl, duracion, fechaCaptura
- **Types**: marcha, postura_estatica

### Plantilla (Insole)
Custom orthopedic insole designs.
- **Fields**: id, casoId, diseño, materiales, pdfUrl, fechaCreacion

### Referencia bibliográfica (Bibliographic Reference)
Books, articles, and medical evidence consulted.
- **Fields**: id, planId, autor, año, titulo, fuente, url, idiomaOriginal

## Relationships

- **Paciente** has many Casos clínicos
- **Caso clínico** has one Evaluación inicial
- **Caso clínico** has one Plan de tratamiento
- **Caso clínico** has many Sesiones de tratamiento
- **Evaluación** has many Huellas
- **Evaluación** has many Videos de postura
- **Plan de tratamiento** has many Referencias bibliográficas
- **Plantilla** belongs to a Caso clínico

## Design Notes

The data model follows a clinical workflow: Patient → Clinical Case → Evaluation → Treatment Plan → Treatment Sessions. Each case represents a focused treatment episode for a specific condition, allowing longitudinal tracking across multiple cases for the same patient.

Treatment modalities can be combined (e.g., insoles + exercises), and progress is monitored through pain scales (END) and functional independence indices (Barthel/Lawton).
