# ADR-006: Prisma 7 Driver Adapter Migration

**Status:** ✅ Accepted  
**Date:** 2026-01-08  
**Deciders:** Sisyphus (AI), User

---

## Context

The project was upgraded to Prisma 7. In this version, the `url` property is deprecated/removed from `schema.prisma` for runtime use. Connections must now be handled via **Driver Adapters** for direct database access in standard Node.js environments.

---

## Decision

We migrated the `PrismaService` and `seed.ts` to use `@prisma/adapter-pg`.

Key Implementation Details:

1.  **Dependency Addition**: Added `pg` and `@prisma/adapter-pg` to the server dependencies.
2.  **Constructor Update**: The `PrismaClient` is now instantiated by passing a `PrismaPg` adapter wrapping a `pg.Pool`.
3.  **Schema Cleanup**: Removed the `url` field from the `datasource` block in `schema.prisma` to comply with version 7 validation rules.

---

## Consequences

### Positive

- ✅ Full compatibility with Prisma 7 and future versions.
- ✅ Better support for connection pooling and edge runtimes.
- ✅ Clearer separation between CLI config (`prisma.config.ts`) and runtime logic.

### Negative

- ⚠️ Increased boilerplate in `PrismaService` (requires manual pool management).
- ⚠️ Adds a dependency on the native `pg` driver.

---

## References

- `apps/server/src/prisma/prisma.service.ts`
- `apps/server/prisma/seed.ts`
- [Prisma 7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)
