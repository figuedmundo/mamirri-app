import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

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
  diagnosis?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  voiceNotes?: any;
}
