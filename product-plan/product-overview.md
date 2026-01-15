# Mamirri App — Product Overview

## Summary

Una app de tablet o celulares para fisioterapeutas que captura datos por voz y fotos, analiza huellas plantares, analiza videos de posturas o caminatas tomadas por el profesional y sugiere tratamientos basados en evidencia médica, libros y artículos en cualquier idioma, presentando toda la información en español o inglés.

## Planned Sections

1. **Pacientes** — Gestión de expedientes médicos con captura por voz, fotos de antes/después y seguimiento longitudinal de cada paciente.

2. **Análisis** — Análisis visual de huellas plantares y videos de postura/caminata para detectar patrones y evolución objetiva.

3. **Biblioteca Médica** — Búsqueda inteligente en libros, artículos y evidencia médica global en cualquier idioma con resultados en español o inglés.

4. **Plantillas** — Sugerencias de diseño de plantillas ortopédicas personalizadas basadas en el análisis del paciente y evidencia médica.

## Data Model

**Core Entities:**
- Paciente — La persona que recibe tratamiento, con su historial completo
- Caso clínico — Un episodio de atención para una condición específica
- Evaluación — Sesión de diagnóstico con fotos, videos y hallazgos iniciales
- Plan de tratamiento — Plan definido por el doctor con objetivos y modalidades
- Sesión de tratamiento — Visitas donde se ejecuta el plan y se monitorea el progreso
- Huella — Imágenes de huellas plantares capturadas para análisis visual
- Video de postura — Grabaciones de caminatas o posturas para análisis biomecánico
- Plantilla — Diseños de plantillas ortopédicas personalizadas
- Referencia bibliográfica — Libros, artículos y evidencia médica consultada

## Design System

**Colors:**
- Primary: Teal — Used for buttons, links, key accents
- Secondary: Sky — Used for tags, highlights, secondary elements
- Neutral: Slate — Used for backgrounds, text, borders

**Typography:**
- Heading: DM Sans
- Body: DM Sans
- Mono: IBM Plex Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and application shell
2. **Pacientes** — Medical record management with voice capture and patient follow-up
3. **Análisis** — Visual analysis of footprints and posture/gait videos
4. **Biblioteca Médica** — Smart search in medical literature with AI-powered results
5. **Plantillas** — Custom orthopedic insole design with AI assistance and manual precision tools

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
