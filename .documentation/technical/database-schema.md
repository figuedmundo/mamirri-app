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

## Evaluations (`evaluations`)

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

---

**Last Updated:** 2026-01-14
