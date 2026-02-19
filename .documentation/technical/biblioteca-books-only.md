# Biblioteca (Books-Only) — Technical Guide

**Last Updated:** 2026-02-18

This document describes the current production behavior of Biblioteca as a **books-only** clinical search tool, including its UI routing, API contracts, caching, and the "Open book" viewer.

## What Biblioteca Is (Today)

- Biblioteca is a **search-first** experience over the ingested knowledge base (`documents` + `embeddings`).
- The clinician types a query and receives **book passages** grouped by book, each with a citation (title/author/page).
- Curated overlays (Protocols, Categories, Bibliography) exist in the backend as historical/optional functionality but are **not part of the user workflow** right now.

## UI Behavior

### Routes

- Search page: `/biblioteca`
- Open book viewer (nested): `/biblioteca/libros/:documentId`

The book viewer is nested so the search UI stays mounted. This prevents losing results when opening a book and avoids re-triggering retrieval requests when navigating back.

### Layout

- Desktop: search results on the left + book viewer panel on the right.
- Mobile: book viewer is still reachable via navigation, but the nested routing preserves the search state.

### Result Rendering

Each passage is rendered as:

- **Coincidencia**: `snippet` (focused match) rendered as sanitized Markdown.
- **Contexto ampliado**: `context` (broader parent context) rendered as sanitized Markdown.
- **Abrir libro**: opens the full Markdown source at the cited page.

## Client Caching (Cost Control)

### Why caching matters

Library search requests can trigger embedding generation for the query on the server. Re-running the same search unnecessarily increases cost.

### Current caching policy

- Library searches are cached client-side by query string for **6 hours**.
- Opening a book does not invalidate results because the viewer is nested under the search route.

Implementation:

- `apps/client/src/hooks/use-library.ts` sets `staleTime` for `useLibrarySearch` to 6 hours.

How to force a re-run (when you actually want fresh retrieval):

- Change the query text (query key changes).
- Reloading the page clears in-memory cache and will re-run retrieval.

## API Contracts

### Search endpoint

Biblioteca uses:

- `GET /api/v1/library/protocols?q=<query>`

Even though the route name includes `protocols`, the UI currently uses it for **RAG book search**.

Response fields used by the UI:

- `ragResults[].documentId`
- `ragResults[].documentTitle`
- `ragResults[].documentAuthor`
- `ragResults[].documentFilePath`
- `ragResults[].pageNumber`
- `ragResults[].snippet`
- `ragResults[].context`

`ragResults[].content` is intentionally **the full parent context**, because other consumers (AI analysis) use `content` as the LLM context.

### Open book endpoint

The book viewer uses:

- `GET /api/v1/library/books/:documentId/markdown`

This returns:

- `title`, `author`, `filePath`
- `content`: the full Markdown source

## Production Setup: Mounting Markdown Books

The book viewer requires the server container to have access to the source Markdown files referenced by `documents.filePath`.

Recommended approach:

- Keep markdowns on the host (example: `/opt/mamirri/library/markdowns`).
- Mount into the server container at: `/app/data/library/markdowns`.

Example:

```yaml
volumes:
  - /opt/mamirri/library/markdowns:/app/data/library/markdowns:ro
```

Notes:

- The server reads only from `data/library/markdowns/` to avoid path traversal.
- Keep relative paths stable between ingestion and production.

## Page Jumping

The Markdown conversion pipeline inserts page markers like:

```md
<!-- PAGE_NUMBER: 234 -->
```

The book viewer parses these markers and scrolls to `page=<N>` when opening a citation.

If a marker is missing, the book still loads but the automatic scroll may not land exactly at the intended location.

## Security Notes

- Book Markdown is returned only to authenticated users.
- Rendering uses sanitization and does not allow raw HTML injection.
- External links inside rendered Markdown open in a new tab.

## Relevant Code

- Search + UI:
  - `apps/client/src/pages/Biblioteca.tsx`
  - `apps/client/src/components/library/LibraryDashboard.tsx`
- Book viewer:
  - `apps/client/src/pages/BibliotecaBook.tsx`
- Client API:
  - `apps/client/src/api/library.ts`
  - `apps/client/src/hooks/use-library.ts`
  - `apps/client/src/types/library.ts`
- Server endpoints:
  - `apps/server/src/modules/library/library.controller.ts`
  - `apps/server/src/modules/library/library.service.ts`
- Retrieval payload:
  - `apps/server/src/modules/knowledge-base/knowledge-base.service.ts`
