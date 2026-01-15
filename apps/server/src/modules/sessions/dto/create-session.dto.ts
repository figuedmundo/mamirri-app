import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    description: 'ID of the clinical case this session belongs to',
    example: 'clm1234567890',
  })
  @IsUUID()
  @IsNotEmpty()
  clinicalCaseId: string;

  @ApiProperty({
    description: 'Date of the session',
    example: '2023-01-15T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Phase number of the treatment',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  phaseNumber: number;

  @ApiProperty({
    description: 'List of procedures applied',
    example: ['Massage', 'Stretching'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  procedures: string[];

  @ApiProperty({
    description: 'Patient response to the treatment',
    example: 'Patient felt relief',
  })
  @IsString()
  @IsNotEmpty()
  patientResponse: string;

  @ApiProperty({
    description: 'Pain level at the end of the session (0-10)',
    example: 4,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  finalPainLevel: number;

  @ApiProperty({
    description: 'Therapist observations',
    example: 'Improved range of motion',
  })
  @IsString()
  @IsNotEmpty()
  observations: string;
}
