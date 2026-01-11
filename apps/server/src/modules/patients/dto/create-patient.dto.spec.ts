import { validate } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';

describe('CreatePatientDto', () => {
  it('should validate a correct dto', async () => {
    const dto = new CreatePatientDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.dob = '1990-01-01'; // Past date
    dto.email = 'john@example.com';
    dto.phone = '+14155552671';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when dob is in the future', async () => {
    const dto = new CreatePatientDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    dto.dob = futureDate.toISOString().split('T')[0];
    dto.email = 'john@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const dobError = errors.find((e) => e.property === 'dob');
    expect(dobError).toBeDefined();
    // We expect a constraint related to our custom validator or generic date validation
  });

  it('should fail when required fields are missing', async () => {
    const dto = new CreatePatientDto();
    // Missing firstName, lastName, dob

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining(['firstName', 'lastName', 'dob']),
    );
  });
});
