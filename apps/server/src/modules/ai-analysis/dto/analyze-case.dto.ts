import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AnalyzeCaseDto {
  @ApiProperty({
    description: 'ID of the clinical case to analyze',
    example: 'clm1234567890',
  })
  @IsString()
  @IsNotEmpty()
  clinicalCaseId: string;
}
