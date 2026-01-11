import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the patient (CUID)',
    example: 'clq3...',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the patient',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the patient',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-01T00:00:00.000Z',
  })
  dob: Date;

  @ApiPropertyOptional({
    description: 'Email address of the patient',
    example: 'john.doe@example.com',
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Phone number of the patient',
    example: '+1234567890',
  })
  phone: string | null;

  @ApiProperty({
    description: 'Date and time when the patient record was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
