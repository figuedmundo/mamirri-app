import { ApiProperty } from '@nestjs/swagger';

export class RawAnalysisResponseDto {
  @ApiProperty({ description: 'ID of the AI analysis' })
  analysisId: string;

  @ApiProperty({
    description: 'Raw text response returned by the LLM model',
    nullable: true,
  })
  rawModelResponse: string | null;

  @ApiProperty({
    description: 'System prompt sent to the LLM model',
    nullable: true,
  })
  systemPrompt: string | null;

  @ApiProperty({
    description: 'User prompt sent to the LLM model',
    nullable: true,
  })
  userPrompt: string | null;

  @ApiProperty({ description: 'Timestamp when analysis was created' })
  createdAt: Date;

  @ApiProperty({
    description:
      'True when rawModelResponse has been redacted for safer display in UI',
  })
  isRedacted: boolean;
}
