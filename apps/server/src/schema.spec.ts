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
      expect(schemaContent).toMatch(/id\s+String\s+@id/);
      expect(schemaContent).toMatch(/email\s+String\s+@unique/);
      expect(schemaContent).toMatch(/passwordHash\s+String/);
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/role\s+String/);
    });
  });

  describe('Patient Model', () => {
    it('should have name, therapistId, emergencyContact, referralSource, medicalFlags', () => {
      expect(schemaContent).toMatch(/name\s+String/);
      expect(schemaContent).toMatch(/therapistId\s+String/);
      expect(schemaContent).toMatch(/emergencyContact\s+Json\?/);
      expect(schemaContent).toMatch(/referralSource\s+String\?/);
      expect(schemaContent).toMatch(/medicalFlags\s+String\[\]/);
    });
  });

  describe('Session Model', () => {
    it('should have patientId, therapistId, status, date', () => {
      expect(schemaContent).toMatch(/patientId\s+String/);
      expect(schemaContent).toMatch(/therapistId\s+String/);
      expect(schemaContent).toMatch(/status\s+String/);
      expect(schemaContent).toMatch(/date\s+DateTime/);
    });
  });
});
