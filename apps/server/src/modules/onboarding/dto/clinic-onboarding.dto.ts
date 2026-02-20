import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClinicOnboardingDto {
  @ApiProperty({ description: 'Clinic name', example: 'Fisioterapia García' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  clinicName: string;

  @ApiProperty({
    description: 'Clinic email address',
    example: 'clinic@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  clinicEmail: string;

  @ApiPropertyOptional({
    description: 'Clinic phone number',
    example: '+34 912 345 678',
  })
  @IsOptional()
  @IsString()
  clinicPhone?: string;

  @ApiPropertyOptional({
    description: 'Clinic address',
    example: 'Calle Mayor 123, Madrid',
  })
  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @ApiProperty({ description: 'Admin full name', example: 'Dr. María García' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'maria@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({
    description: 'Admin password',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;

  @ApiPropertyOptional({
    description: 'Admin professional license number',
    example: 'F-12345',
  })
  @IsOptional()
  @IsString()
  adminLicenseNumber?: string;
}
