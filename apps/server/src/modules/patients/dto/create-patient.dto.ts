import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  Length,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsDateStringNotFuture } from '../../../common/validators/is-date-string-not-future.validator';

export class EmergencyContactDto {
  [key: string]: any;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreatePatientDto {
  @ApiProperty({
    description: 'Full name of the patient',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Occupation of the patient',
    example: 'Engineer',
  })
  @IsString()
  @IsNotEmpty()
  occupation: string;

  @ApiPropertyOptional({
    description: 'Previous occupation of the patient',
    example: 'Student',
  })
  @IsOptional()
  @IsString()
  previousOccupation?: string;

  @ApiPropertyOptional({
    description: 'Gender',
    example: 'Male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsDateStringNotFuture()
  birthDate: string;

  @ApiPropertyOptional({
    description: 'Email address of the patient',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '12345678',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    type: () => EmergencyContactDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @ApiPropertyOptional({
    description: 'How the patient found the clinic',
    example: 'Instagram',
  })
  @IsOptional()
  @IsString()
  referralSource?: string;

  @ApiPropertyOptional({
    description:
      'Specific details about the referral source (e.g. Doctor name)',
    example: 'Dr. Smith',
  })
  @IsOptional()
  @IsString()
  referralSourceDetails?: string;

  @ApiPropertyOptional({
    description: 'Medical flags/alerts',
    example: ['Diabetes', 'Hipertensión'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  medicalFlags?: string[];

  @ApiPropertyOptional({
    description: 'Details for "Other" medical flags',
    example: 'Severe allergy to latex',
  })
  @IsOptional()
  @IsString()
  medicalFlagsOther?: string;
}
