import fs from 'fs/promises';

describe('Prisma Schema Validation', () => {
  let schemaContent: string;

  beforeAll(async () => {
    const schemaPath = './schema.prisma';
    schemaContent = await fs.readFile(schemaPath, 'utf-8');
  });

  describe('Schema File Structure', () => {
    it('should be valid Prisma schema', () => {
      expect(schemaContent).toContain('generator client');
      expect(schemaContent).toContain('datasource db');
      expect(schemaContent).toContain('model User');
      expect(schemaContent).toContain('model Patient');
      expect(schemaContent).toContain('model Session');
    });

    it('should use DATABASE_URL environment variable', () => {
      expect(schemaContent).toContain('url      = env("DATABASE_URL")');
    });

    it('should have pgvector extension commented', () => {
      expect(schemaContent).toContain('pgvector');
    });
  });

  describe('User Model', () => {
    it('should have id field with @id decorator', () => {
      expect(schemaContent).toContain('id           String   @id');
    });

    it('should have email field with @unique', () => {
      expect(schemaContent).toContain('email        String    @unique');
    });

    it('should have passwordHash field', () => {
      expect(schemaContent).toContain('passwordHash String');
    });

    it('should have name field', () => {
      expect(schemaContent).toContain('name         String');
    });

    it('should have role field with default THERAPIST', () => {
      expect(schemaContent).toContain(
        'role         String     @default("THERAPIST")',
      );
    });

    it('should have email index', () => {
      expect(schemaContent).toContain('@@index([email])');
    });

    it('should have users map', () => {
      expect(schemaContent).toContain('@@map("users")');
    });
  });

  describe('Patient Model', () => {
    it('should have firstName field', () => {
      expect(schemaContent).toContain('firstName   String');
    });

    it('should have lastName field', () => {
      expect(schemaContent).toContain('lastName    String');
    });

    it('should have dob field as DateTime', () => {
      expect(schemaContent).toContain('dob         DateTime');
    });

    it('should have optional phone field', () => {
      expect(schemaContent).toContain('phone       String?');
    });

    it('should have optional email field', () => {
      expect(schemaContent).toContain('email       String?');
    });

    it('should have therapistId field', () => {
      expect(schemaContent).toContain('therapistId String');
    });

    it('should have firstName and lastName index', () => {
      expect(schemaContent).toContain('@@index([firstName, lastName])');
    });

    it('should have patients map', () => {
      expect(schemaContent).toContain('@@map("patients")');
    });
  });

  describe('Session Model', () => {
    it('should have SessionStatus enum with DRAFT and FINALIZED', () => {
      expect(schemaContent).toContain('enum SessionStatus');
      expect(schemaContent).toContain('DRAFT');
      expect(schemaContent).toContain('FINALIZED');
    });

    it('should have patientId field', () => {
      expect(schemaContent).toContain('patientId   String');
    });

    it('should have therapistId field', () => {
      expect(schemaContent).toContain('therapistId String');
    });

    it('should have status field with default DRAFT', () => {
      expect(schemaContent).toContain(
        'status      SessionStatus @default(DRAFT)',
      );
    });

    it('should have optional notes field', () => {
      expect(schemaContent).toContain('notes       String?');
    });

    it('should have date field with default', () => {
      expect(schemaContent).toContain(
        'date        DateTime     @default(now())',
      );
    });

    it('should have patientId, therapistId, date index', () => {
      expect(schemaContent).toContain(
        '@@index([patientId, therapistId, date])',
      );
    });

    it('should have sessions map', () => {
      expect(schemaContent).toContain('@@map("sessions")');
    });

    it('should have relation to Patient with Cascade delete', () => {
      expect(schemaContent).toContain(
        '@@relation(fields: [patientId], references: [id], onDelete: Cascade',
      );
    });

    it('should have relation to User for therapistId', () => {
      expect(schemaContent).toContain(
        '@@relation(fields: [therapistId], references: [id], onDelete: Cascade',
      );
    });
  });
});
