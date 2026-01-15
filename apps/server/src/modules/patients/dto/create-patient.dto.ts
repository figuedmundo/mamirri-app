import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  Length,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { IsDateStringNotFuture } from '../../../common/validators/is-date-string-not-future.validator';

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
    description: 'Age of the patient',
    example: 30,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  age: number;

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
    description: 'Home address',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address?: string;

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
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
