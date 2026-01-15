import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class UpdateClinicalCaseDto {
  @ApiPropertyOptional({
    description: 'Status of clinical case',
    example: 'active',
    enum: ['active', 'completed', 'inactive'],
  })
  @IsOptional()
  @IsEnum(['active', 'completed', 'inactive'], {
    message: 'Status must be one of: active, completed, inactive',
  })
  status?: 'active' | 'completed' | 'inactive';

  @ApiPropertyOptional({
    description: 'Title of clinical case',
    example: 'Knee Rehabilitation - Updated',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Reason for consultation',
    example: 'Updated consultation reason',
  })
  @IsOptional()
  @IsString()
  consultationReason?: string;
}
