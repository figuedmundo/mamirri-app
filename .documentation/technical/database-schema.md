# Database Schema

## Users (`users`)

Stores authentication and profile information for physiotherapists.

| Field          | Type       | Description                         |
| -------------- | ---------- | ----------------------------------- |
| `id`           | `String`   | Unique identifier (CUID)            |
| `email`        | `String`   | **Unique** email address for login  |
| `passwordHash` | `String`   | Bcrypt hashed password              |
| `name`         | `String`   | Full name of the user               |
| `role`         | `String`   | Access level (Default: `THERAPIST`) |
| `createdAt`    | `DateTime` | Timestamp of registration           |

**Indexes:**

- `users_email_idx` (Btree): Optimized search by email.
- `users_email_unique` (Unique): Ensures no duplicate registrations.

## Initialization (`scripts/init-db.sql`)

When Docker starts, it automatically executes the initialization script to:

1. Create the `physio_db` database.
2. Apply a baseline unique constraint on `users(email)` to ensure immediate data integrity before migrations run.

## Patients (`patients`)

Stores clinical profile for individuals receiving treatment.

| Field         | Type        | Description                     |
| ------------- | ----------- | ------------------------------- |
| `id`          | `String`    | Unique identifier (CUID)        |
| `firstName`   | `String`    | Patient's first name            |
| `lastName`    | `String`    | Patient's last name             |
| `dob`         | `DateTime`  | Date of birth                   |
| `phone`       | `String?`   | Optional contact number         |
| `email`       | `String?`   | Optional email                  |
| `therapistId` | `String`    | Relation to the assigned `User` |
| `deletedAt`   | `DateTime?` | Soft delete timestamp           |

**Indexes:**

- `patients_firstName_lastName_idx`: Optimized search for patients by name.

## Clinical Cases (`clinical_cases`)

Represents a specific medical issue or "Episode of Care" for a patient. A patient can have multiple cases over time.

| Field                 | Type       | Description                        |
| --------------------- | ---------- | ---------------------------------- |
| `id`                  | `String`   | Unique identifier (CUID)           |
| `title`               | `String`   | Short title (e.g., "Knee Pain")    |
| `status`              | `String`   | `active`, `completed`, `inactive`  |
| `startDate`           | `DateTime` | When the case started              |
| `consultationReason`  | `String`   | Primary reason for consultation    |
| `pathologicalHistory` | `Json?`    | Flexible history (e.g., surgeries) |
| `patientId`           | `String`   | Foreign key to `Patient`           |

## Evaluation (`evaluation`)

Clinical assessment performed within a Clinical Case. Replaced the 1:N evaluations array with a 1:1 relation to reflect clinical reality and simplify data entry.

| Field            | Type       | Description                        |
| ---------------- | ---------- | ---------------------------------- |
| `id`             | `String`   | Unique identifier (CUID)           |
| `date`           | `DateTime` | Date of evaluation                 |
| `avdEvaluation`   | `Json`     | ADL assessment (Barthel/Lawton)    |
| `painScale`      | `Json`     | Detailed pain map (location, 0-10) |
| `diagnosis`      | `Json`     | SOAP structure (Functional, etc.)  |
| `orthopedicTests` | `Json`     | Dynamically added physical tests   |
| `posturogram`     | `Json`     | Posture analysis markers           |
| `voiceNotes`      | `Json?`    | Optional voice recording link      |
| `clinicalCaseId` | `String`   | Foreign key to `ClinicalCase`      |

**Relations:**

- **One-to-One** with `ClinicalCase`.


Clinical assessments performed within a Clinical Case. Supports 1:N cardinality (Initial, Progress, Final).

| Field            | Type       | Description                        |
| ---------------- | ---------- | ---------------------------------- |
| `id`             | `String`   | Unique identifier (CUID)           |
| `date`           | `DateTime` | Date of evaluation                 |
| `type`           | `String`   | `INITIAL`, `PROGRESS`, `FINAL`     |
| `painScale`      | `Json`     | Detailed pain map (location, 0-10) |
| `diagnosis`      | `Json`     | Clinical diagnosis structure       |
| `clinicalCaseId` | `String`   | Foreign key to `ClinicalCase`      |

**Relations:**

- **Many-to-One** with `ClinicalCase` (One Case has Many Evaluations).

## Treatment Sessions (`treatment_sessions`)

Records of individual therapy sessions linked to a Clinical Case.

| Field            | Type       | Description                              |
| ---------------- | ---------- | ---------------------------------------- |
| `id`             | `String`   | Unique identifier (CUID)                 |
| `date`           | `DateTime` | Session timestamp                        |
| `finalPainLevel` | `Int`      | Simple 0-10 pain score at end of session |
| `procedures`     | `String[]` | List of techniques applied               |
| `clinicalCaseId` | `String`   | Foreign key to `ClinicalCase`            |
| `therapistId`    | `String`   | Foreign key to `User`                    |

## Sessions (`sessions`)

**Deprecated / Legacy**: Use `treatment_sessions` for clinical data. This table is kept for backward compatibility during migration.

| Field         | Type       | Description                         |
| ------------- | ---------- | ----------------------------------- |
| `id`          | `String`   | Unique identifier (CUID)            |
| `patientId`   | `String`   | Foreign key to `Patient`            |
| `therapistId` | `String`   | Foreign key to `User`               |
| `status`      | `Enum`     | `DRAFT` or `FINALIZED`              |
| `notes`       | `String?`  | Clinical documentation/observations |
| `date`        | `DateTime` | Date of the session                 |

**Indexes:**

- `sessions_patientId_therapistId_date_idx`: Optimized for history retrieval.

## Treatment Plans (`treatment_plans`)

Defines the strategy and goals for a Clinical Case.

| Field            | Type     | Description                                      |
| ---------------- | -------- | ------------------------------------------------ |
| `id`             | `String` | Unique identifier (CUID)                         |
| `objectives`     | `Json`   | Therapeutic, prophylactic, and educational goals |
| `phases`         | `Json`   | Array of `TreatmentPhase` objects (5 phases)     |
| `insoleSnapshot` | `Json?`  | Optional snapshot of insole configuration        |
| `clinicalCaseId` | `String` | Foreign key to `ClinicalCase` (Unique)           |

**Relations:**

- **One-to-One** with `ClinicalCase`.

## Clinical Library (`clinical_categories`, `protocols`, `bibliographic_references`)

Optional curated overlay for Biblioteca.

**Current product note (2026-02-18):** the Biblioteca UI runs in **books-only mode** (search over ingested `documents`/`embeddings`). Protocol/category/reference UI is currently quarantined (hidden) to avoid ongoing manual maintenance risk.

### Clinical Categories (`clinical_categories`)

| Field         | Type       | Description                |
| ------------- | ---------- | -------------------------- |
| `id`          | `String`   | Unique identifier (CUID)   |
| `name`        | `String`   | Category display name      |
| `description` | `String`   | Human-readable description |
| `icon`        | `String`   | Icon key used by frontend  |
| `createdAt`   | `DateTime` | Creation timestamp         |

### Protocols (`protocols`)

| Field        | Type        | Description                                      |
| ------------ | ----------- | ------------------------------------------------ |
| `id`         | `String`    | Unique identifier (CUID)                         |
| `title`      | `String`    | Protocol title                                   |
| `categoryId` | `String`    | Foreign key to `clinical_categories`             |
| `definition` | `String`    | Clinical description                             |
| `rationale`  | `String`    | Why protocol is used                             |
| `procedure`  | `String[]`  | Ordered procedural steps                         |
| `tags`       | `String[]`  | Search tags                                      |
| `deletedAt`  | `DateTime?` | Soft-delete timestamp (archived when non-null)   |
| `documentId` | `String?`   | Optional link to source `documents` entry (UUID) |
| `createdAt`  | `DateTime`  | Creation timestamp                               |
| `updatedAt`  | `DateTime`  | Last update timestamp                            |

**Indexes:**

- `protocols_categoryId_idx`
- `protocols_deletedAt_idx`

### Bibliographic References (`bibliographic_references`)

| Field              | Type       | Description                    |
| ------------------ | ---------- | ------------------------------ |
| `id`               | `String`   | Unique identifier (CUID)       |
| `author`           | `String`   | Citation author(s)             |
| `year`             | `Int`      | Publication year               |
| `title`            | `String`   | Work title                     |
| `source`           | `String`   | Journal/book/source            |
| `originalLanguage` | `String`   | Source language (default `es`) |
| `summaryEs`        | `String`   | Spanish summary                |
| `originalText`     | `String?`  | Optional source quote/text     |
| `url`              | `String?`  | Optional external URL          |
| `createdAt`        | `DateTime` | Creation timestamp             |

### Link Tables

- `protocol_references` maps many-to-many between protocols and references.
- `treatment_plan_protocols` maps many-to-many between treatment plans and protocols.

## Knowledge Base Documents (`documents`)

Stores metadata for ingested medical literature.

| Field       | Type       | Description                 |
| ----------- | ---------- | --------------------------- |
| `id`        | `String`   | Unique identifier (UUID)    |
| `title`     | `String`   | Book/Document title         |
| `author`    | `String`   | Author(s)                   |
| `filePath`  | `String`   | Unique path to source file  |
| `metadata`  | `Json?`    | Volume, edition, year, etc. |
| `createdAt` | `DateTime` | Ingestion timestamp         |

Notes:

- `filePath` is used as the canonical pointer to the source book artifact produced during offline ingestion (typically a Markdown file under `apps/server/data/library/markdowns/`).
- Full document text is not stored in this table; retrieval uses chunk content from `embeddings`.

## Embeddings (`embeddings`)

Stores vectorized text chunks for semantic search.

| Field        | Type     | Description                       |
| ------------ | -------- | --------------------------------- |
| `id`         | `String` | Unique identifier (UUID)          |
| `content`    | `String` | Raw text chunk (approx 500 words) |
| `pageNumber` | `Int`    | Reference page in source document |
| `vector`     | `Vector` | 1024-dim embedding (pgvector)     |
| `documentId` | `String` | Foreign key to `Document`         |

---

**Last Updated:** 2026-02-18
