import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  Length,
  IsDateString,
} from 'class-validator';
import { IsDateStringNotFuture } from '../../../common/validators/is-date-string-not-future.validator';

export class CreatePatientDto {
  @ApiProperty({
    description: 'First name of the patient',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the patient',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({
    description: 'Date of birth in ISO 8601 format (YYYY-MM-DD)',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  @IsDateStringNotFuture()
  dob: string;

  @ApiPropertyOptional({
    description: 'Email address of the patient',
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number in E.164 format',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
