# Biblioteca Médica

## Overview

A smart clinical research assistant that acts as a comprehensive catalog of anatomical references, specialized protocols, and global medical evidence. It uses AI-driven natural language search to link complex diagnoses with specific treatments and provides localized summaries of international research, serving as an active consultation tool during patient evaluation.

## User Flows

- **Intelligent Search:** User enters a natural language diagnosis (e.g., "88-year-old patient with hyperkyphosis") -> System suggests relevant articles, protocols (e.g., McKenzie, RPG), and techniques.

- **Category Browsing:** User navigates through structured categories (Osteology, Myology, Elasticity Tests) defined in clinical index.

- **Protocol Consultation:** User selects a specific technique (e.g., "Sphinx Position") -> System displays a "Ficha Explicativa" with definition, justification, and step-by-step procedure.

- **Evidence Verification:** User reviews a treatment -> System shows bibliographic references and allows toggling between original source (often English) and an AI-generated Spanish summary.

## Design Decisions

- Prominent search bar for natural language queries
- Category chips/grid for structured navigation
- Standardized technique card layout (Ficha Explicativa)
- Anatomy viewer carousel for visual references
- Dedicated bibliography panel for citations
- Translation toggle for EN/ES language switching

## Data Used

**Entities:** ReferenciaBibliografica

**From global model:** ReferenciaBibliografica, PlanTratamiento

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- **BibliotecaDashboard** — Main interface with search, categories, and results
- **SearchBar** — Prominent search input with natural language support
- **CategoryNav** — Structured category navigation (Osteology, Myology, etc.)
- **ProtocolList** — List of techniques/protocols matching search or category
- **BibliographyPanel** — Dedicated panel for formal citations and references

## Callback Props

| Callback           | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `onSearch`         | Called when user enters search query or submits search       |
| `onSelectCategory` | Called when user clicks a category filter                    |
| `onSelectProtocol` | Called when user clicks a technique/protocol card            |
| `onToggleLanguage` | Called when user toggles between EN/ES translation           |
| `onViewReference`  | Called when user clicks to view full bibliographic reference |
| `onAddToCase`      | Called when user wants to add reference to treatment plan    |
