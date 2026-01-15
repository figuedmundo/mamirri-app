import { validate } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';

describe('CreatePatientDto', () => {
  it('should validate a correct dto', async () => {
    const dto = new CreatePatientDto();
    dto.name = 'John Doe';
    dto.age = 30;
    dto.occupation = 'Engineer';
    dto.birthDate = '1990-01-01'; // Past date
    dto.email = 'john@example.com';
    dto.phone = '+14155552671';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when birthDate is in the future', async () => {
    const dto = new CreatePatientDto();
    dto.name = 'John Doe';
    dto.age = 30;
    dto.occupation = 'Engineer';
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    dto.birthDate = futureDate.toISOString().split('T')[0];
    dto.email = 'john@example.com';
    dto.phone = '+14155552671';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const dobError = errors.find((e) => e.property === 'birthDate');
    expect(dobError).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const dto = new CreatePatientDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map((e) => e.property)).toEqual(
      expect.arrayContaining([
        'name',
        'age',
        'occupation',
        'birthDate',
        'phone',
      ]),
    );
  });
});
