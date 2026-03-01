import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject, IsArray } from 'class-validator';

export class UpdateEvaluationDto {
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
  painScale?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  diagnosis?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  voiceNotes?: any;
}
