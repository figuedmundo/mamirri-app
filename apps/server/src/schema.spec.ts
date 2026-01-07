import fs from 'fs/promises';
import path from 'path';

describe('Prisma Schema Validation', () => {
  let schemaContent: string;

  beforeAll(async () => {
    const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
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
  });

  describe('User Model', () => {
    it('should have id, email, passwordHash, name, role', () => {
      expect(schemaContent).toContain('id           String   @id');
      expect(schemaContent).toContain('email        String    @unique');
      expect(schemaContent).toContain('passwordHash String');
      expect(schemaContent).toContain('name         String');
      expect(schemaContent).toContain('role         String');
    });
  });

  describe('Patient Model', () => {
    it('should have firstName, lastName, dob, therapistId', () => {
      expect(schemaContent).toContain('firstName   String');
      expect(schemaContent).toContain('lastName    String');
      expect(schemaContent).toContain('dob         DateTime');
      expect(schemaContent).toContain('therapistId String');
    });
  });

  describe('Session Model', () => {
    it('should have patientId, therapistId, status, date', () => {
      expect(schemaContent).toContain('patientId   String');
      expect(schemaContent).toContain('therapistId String');
      expect(schemaContent).toContain('status      SessionStatus');
      expect(schemaContent).toContain('date        DateTime');
    });
  });
});
