# Raw Feature Idea

## Feature Description

Backend: Patients CRUD (routes, validation, Prisma)

## Source

Product Roadmap - Phase 1 (Week 5: Patients - Core Data Model), Task 5.1

## Context

This is the first major feature in Phase 1 (MVP) of the MamirriApp project. The backend infrastructure is complete (Docker, Prisma, NestJS structure), and authentication is implemented. The Patient model exists in the Prisma schema, but the CRUD operations are not yet implemented.

## Known Information

- Patient model exists in Prisma schema with fields: id, firstName, lastName, dob, phone, email, therapistId, createdAt
- PatientsModule, PatientsController, and PatientsService are currently empty stubs
- Project uses NestJS with Prisma ORM
- Authentication uses JWT with JwtAuthGuard
- Validation library is class-validator (though ValidationPipe not yet registered globally)
- Swagger is configured for API documentation
