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

## Sessions (`sessions`)

Represents individual treatment encounters.

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

**Last Updated:** 2026-01-08
