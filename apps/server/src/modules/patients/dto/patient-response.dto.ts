import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the patient (CUID)',
    example: 'clq3...',
  })
  id: string;

  @ApiProperty({
    description: 'Full name of the patient',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Age of the patient',
    example: 30,
  })
  age: number;

  @ApiProperty({
    description: 'Occupation',
    example: 'Engineer',
  })
  occupation: string;

  @ApiPropertyOptional({
    description: 'Previous occupation',
    example: 'Student',
  })
  previousOccupation: string | null;

  @ApiPropertyOptional({
    description: 'Address',
    example: '123 Main St',
  })
  address: string | null;

  @ApiPropertyOptional({
    description: 'Gender',
    example: 'Male',
  })
  gender: string | null;

  @ApiProperty({
    description: 'Date of birth',
    example: '1990-01-01T00:00:00.000Z',
  })
  birthDate: Date;

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
