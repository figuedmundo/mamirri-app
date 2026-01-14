import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min, IsObject } from 'class-validator';

export class UpdateEvaluationDto {
  @ApiPropertyOptional({
    description: 'Pain scale level (0-10)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painScale?: number;

  @ApiPropertyOptional({
    description: 'Barthel Index (0-100)',
    example: 80,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  barthelIndex?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  posturogram?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  orthopedicTests?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  avdEvaluation?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  diagnosis?: any;
}
