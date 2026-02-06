import { ApiProperty } from '@nestjs/swagger';

class SuggestionDto {
  @ApiProperty({ description: 'Title of the suggestion' })
  title: string;

  @ApiProperty({ description: 'Detailed description of the suggestion' })
  description: string;

  @ApiProperty({
    description: 'Confidence level of the suggestion',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
  })
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  @ApiProperty({
    description: 'Reasoning behind the suggestion',
    required: false,
  })
  reasoning?: string;
}

class CitationDto {
  @ApiProperty({ description: 'Quote from the medical literature in Spanish' })
  quote: string;

  @ApiProperty({
    description: 'Original quote in English if translated',
    required: false,
  })
  quoteOriginal?: string;

  @ApiProperty({ description: 'Title of the source document' })
  documentTitle: string;

  @ApiProperty({ description: 'Author of the source document' })
  author: string;

  @ApiProperty({ description: 'Page number in the source document' })
  pageNumber?: number;

  @ApiProperty({
    description: 'Relevance score between 0 and 1',
    minimum: 0,
    maximum: 1,
  })
  relevance: number;
}

class ReasoningDto {
  @ApiProperty({
    description: 'Step 1: Understanding the patient presentation',
  })
  step1_understanding: string;

  @ApiProperty({ description: 'Step 2: Literature review and evidence' })
  step2_literature: string;

  @ApiProperty({ description: 'Step 3: Synthesis and recommendations' })
  step3_synthesis: string;
}

class ServiceStatusDto {
  @ApiProperty({ description: 'RAG service status' })
  rag: boolean;

  @ApiProperty({ description: 'Vision service status' })
  vision: boolean;

  @ApiProperty({ description: 'Voice service status' })
  voice: boolean;

  @ApiProperty({ description: 'LLM service status' })
  llm: boolean;
}

class MetadataDto {
  @ApiProperty({ description: 'Number of tokens in the query' })
  queryTokens: number;

  @ApiProperty({ description: 'Number of tokens in the response' })
  responseTokens: number;

  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTimeMs: number;

  @ApiProperty({ description: 'Whether anonymization was applied' })
  anonymizationApplied: boolean;

  @ApiProperty({ description: 'Number of translations applied' })
  translationsApplied: number;

  @ApiProperty({
    description: 'Status of underlying services',
    type: ServiceStatusDto,
    required: false,
  })
  serviceStatus?: ServiceStatusDto;

  @ApiProperty({
    description: 'Warnings generated during analysis',
    type: [String],
    required: false,
  })
  warnings?: string[];
}

export class AnalysisResultDto {
  @ApiProperty({
    description: 'Primary treatment suggestion',
    type: SuggestionDto,
  })
  primarySuggestion: SuggestionDto;

  @ApiProperty({
    description: 'Alternative suggestions',
    type: [SuggestionDto],
    maxItems: 3,
  })
  alternatives: SuggestionDto[];

  @ApiProperty({
    description: 'Citations from medical literature',
    type: [CitationDto],
  })
  citations: CitationDto[];

  @ApiProperty({
    description: 'Chain-of-Thought reasoning process',
    type: ReasoningDto,
  })
  reasoning: ReasoningDto;

  @ApiProperty({
    description: 'Analysis metadata',
    type: MetadataDto,
  })
  metadata: MetadataDto;
}
