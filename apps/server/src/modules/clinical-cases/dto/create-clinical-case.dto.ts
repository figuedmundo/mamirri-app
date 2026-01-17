import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateClinicalCaseDto {
  @ApiProperty({
    description: 'ID of the patient this case belongs to',
    example: 'clm1234567890',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    description: 'Title of the clinical case',
    example: 'Knee Rehabilitation',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Reason for consultation',
    example: 'Patient reports chronic knee pain for 3 months',
    required: false,
  })
  @IsString()
  @IsOptional()
  consultationReason?: string;
}
