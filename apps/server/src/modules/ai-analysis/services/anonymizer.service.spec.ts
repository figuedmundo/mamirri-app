import { AnonymizerService } from './anonymizer.service';

describe('AnonymizerService', () => {
  let service: AnonymizerService;

  beforeEach(() => {
    service = new AnonymizerService();
  });

  describe('anonymize', () => {
    const mockCaseData = {
      id: 'case-123',
      title: 'Test Case',
      consultationReason: 'Back pain',
      patient: {
        id: 'patient-123',
        name: 'María García',
        email: 'maria@example.com',
        phone: '+34 612 345 678',
        birthDate: new Date('1980-05-15'),
        gender: 'female',
        occupation: 'Teacher',
        emergencyContact: { name: 'Juan García', phone: '+34 612 345 679' },
      },
    };

    it('should replace patient name with [PATIENT]', () => {
      const result = service.anonymize(mockCaseData);

      expect(result.text).toContain('[PATIENT]');
      expect(result.text).not.toContain('María García');
      expect(result.mapping['[PATIENT]']).toBe('María García');
    });

    it('should convert birthDate to [AGE] años', () => {
      const result = service.anonymize(mockCaseData);

      expect(result.text).toContain('[AGE] años');
      expect(result.text).not.toContain('1980-05-15');
    });

    it('should remove email, phone, and emergencyContact', () => {
      const result = service.anonymize(mockCaseData);

      expect(result.text).not.toContain('maria@example.com');
      expect(result.text).not.toContain('+34 612 345 678');
      expect(result.text).not.toContain('Juan García');
    });

    it('should store reversible mapping', () => {
      const result = service.anonymize(mockCaseData);

      expect(result.mapping).toBeDefined();
      expect(Object.keys(result.mapping).length).toBeGreaterThan(0);
    });
  });

  describe('rehydrate', () => {
    it('should correctly restore placeholders', () => {
      const text = 'El paciente [PATIENT] tiene [AGE] años de edad.';
      const mapping = {
        '[PATIENT]': 'María García',
        '[AGE] años': '44 años',
      };

      const result = service.rehydrate(text, mapping);

      expect(result).toContain('María García');
      expect(result).not.toContain('[PATIENT]');
    });
  });
});
