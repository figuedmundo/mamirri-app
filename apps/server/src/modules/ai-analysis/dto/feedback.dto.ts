import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitFeedbackDto {
  @ApiProperty({ description: 'Whether the suggestion was helpful' })
  @IsBoolean()
  isPositive: boolean;

  @ApiProperty({
    description: 'Optional comment about the suggestion',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}

export class FeedbackResponseDto {
  @ApiProperty({ description: 'Unique ID of the feedback' })
  id: string;

  @ApiProperty({ description: 'ID of the analysis this feedback belongs to' })
  aiAnalysisId: string;

  @ApiProperty({
    description: 'Index of the suggestion (0 for primary, 1+ for alternatives)',
  })
  suggestionIndex: number;

  @ApiProperty({ description: 'Whether the suggestion was helpful' })
  isPositive: boolean;

  @ApiProperty({ description: 'Optional comment', required: false })
  comment?: string;

  @ApiProperty({ description: 'When the feedback was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the feedback was last updated' })
  updatedAt: Date;
}
