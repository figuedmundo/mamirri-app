# Análisis

## Overview

Herramientas de análisis objetivo para evaluación biomecánica: podoscopia digital (huellas plantares), posturograma digital (postura estática), análisis de video (marcha dinámica), y dashboard de evolución objetiva comparando estado inicial vs. final.

## User Flows

- **Análisis de Huellas:** Cargar huella → Clasificar bóveda (plano/cavo/normal) → Visualizar heatmap de presión → Detectar simetría entre pie izquierdo/derecho

- **Posturograma:** Capturar 4 vistas (anterior, posterior, laterales) → Marcar puntos anatómicos → Detectar desviaciones (escoliosis, hiperlordosis, alineación pelvis)

- **Análisis de Video:** Cargar video → Reproducir en slow-motion → Analizar fases de marcha (talón → despegue → aterrizaje) → Detectar actitud antálgica y ángulos articulares dinámicos → Comparar sesión inicial vs. sesión 15 con overlay/ghosting

- **Evolución:** Comparar test funcionales (Schober, Dedo-Suelo) → Visualizar reducción de dolor (Escala END) → Generar diagnóstico comparativo (Inicial vs. Final)

## Design Decisions

- Dashboard with comparative charts for objective progress tracking
- Multi-view posturogram viewer for comprehensive posture assessment
- Video player with slow-motion and frame-by-frame analysis
- Heatmap visualization for foot pressure analysis
- Side-by-side comparison for initial/final state tracking

## Data Used

**Entities:** Huella, VideoDePostura, Posturograma, Evaluacion, CasoClinico

**From global model:** Paciente, CasoClinico, Huella, VideoDePostura

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- **AnalisisDashboard** — Overview dashboard with case comparison and key metrics
- **EvolucionDashboard** — Progress charts comparing initial vs. final state
- **DiagnosticoComparativoCard** — Summary card showing improvement/decline indicators
- **DolorChart** — Line chart tracking pain levels over sessions
- **TestsComparativosChart** — Bar chart comparing functional test results (Schober, etc.)
- **VideoAnalysis** — Video player with slow-motion and angle detection
- **PosturogramaView** — 4-view posturogram with anatomical point markers
- **HuellaAnalysis** — Footprint viewer with pressure heatmap and arch classification

## Callback Props

| Callback             | Description                                                            |
| -------------------- | ---------------------------------------------------------------------- |
| `onSelectCase`       | Called when user selects a clinical case to analyze                    |
| `onUploadVideo`      | Called when user uploads new posture/gait video                        |
| `onUploadHuella`     | Called when user uploads footprint image                               |
| `onSavePosturograma` | Called when user saves posturogram with marked anatomical points       |
| `onExportReport`     | Called when user wants to export analysis report                       |
| `onPlay`             | Called when user plays video                                           |
| `onPause`            | Called when user pauses video                                          |
| `onSeek`             | Called when user seeks to specific timestamp                           |
| `onToggleSlowMotion` | Called when user toggles slow-motion mode                              |
| `onSelectView`       | Called when user selects posturogram view (anterior/posterior/lateral) |
| `onToggleComparison` | Called when user toggles before/after comparison mode                  |
