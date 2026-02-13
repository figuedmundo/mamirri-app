import { ApiProperty } from '@nestjs/swagger';

class FindingDto {
  @ApiProperty({ description: 'Anatomical area analyzed' })
  area: string;

  @ApiProperty({ description: 'Clinical observation' })
  observation: string;

  @ApiProperty({ enum: ['normal', 'mild', 'moderate', 'severe'] })
  severity: string;
}

class ConcernDto {
  @ApiProperty({ description: 'Description of concern' })
  description: string;

  @ApiProperty({ description: 'Clinical implication' })
  clinicalImplication: string;
}

class StructuredAnalysisDto {
  @ApiProperty({ type: [FindingDto] })
  findings: FindingDto[];

  @ApiProperty({ type: [ConcernDto] })
  concerns: ConcernDto[];

  @ApiProperty({ type: [String] })
  recommendations: string[];

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH'] })
  confidence: string;
}

class MetadataDto {
  @ApiProperty({ description: 'Processing time in milliseconds' })
  processingTimeMs: number;

  @ApiProperty({ description: 'AI model used' })
  modelUsed: string;

  @ApiProperty({ enum: ['POSTUROGRAM', 'FOOTPRINT'] })
  imageType: string;
}

export class VisionAnalysisResultDto {
  @ApiProperty({ description: 'Raw analysis text from AI' })
  rawAnalysis: string;

  @ApiProperty({ type: StructuredAnalysisDto })
  structuredAnalysis: StructuredAnalysisDto;

  @ApiProperty({
    nullable: true,
    description: 'Warning if image quality is suboptimal',
  })
  qualityWarning: string | null;

  @ApiProperty({ type: MetadataDto })
  metadata: MetadataDto;
}
